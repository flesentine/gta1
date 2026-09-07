extends "res://scripts/world_manager_build21.gd"

const RESERVATION_DISTANCE := 122.0
const RESERVATION_HOLD := 1.25
const TURN_ARC_DISTANCE := 165.0
const TURN_ARC_LEAD := 72.0

var intersection_reservations: Dictionary = {}

func _pace_traffic() -> void:
    super._pace_traffic()
    _apply_turn_arcs()
    _apply_intersection_reservations()

func _apply_turn_arcs() -> void:
    if game == null:
        return
    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value == null or not bool(ai_value):
            continue
        if not bool(car.get_meta("build21_turn_pocket", false)):
            car.set_meta("build22_turn_arc", false)
            continue
        var route_value = car.get("ai_route")
        if not route_value is PackedVector2Array or route_value.size() < 3:
            continue
        var route: PackedVector2Array = route_value.duplicate()
        var index := posmod(int(car.get("ai_index")), route.size())
        var corner := route[index]
        var next_point := route[(index + 1) % route.size()]
        var distance := car.global_position.distance_to(corner)
        if distance > TURN_ARC_DISTANCE:
            car.set_meta("build22_turn_arc", false)
            continue
        var outgoing := (next_point - corner).normalized()
        if outgoing.length_squared() <= 0.001:
            continue
        var blend := clamp((TURN_ARC_DISTANCE - distance) / 115.0, 0.0, 1.0)
        route[index] = corner + outgoing * TURN_ARC_LEAD * blend
        car.set("ai_route", route)
        car.set_meta("build22_turn_arc", true)

func _apply_intersection_reservations() -> void:
    if game == null:
        return
    var now := Time.get_ticks_msec() / 1000.0
    for key in intersection_reservations.keys().duplicate():
        var reservation: Dictionary = intersection_reservations[key]
        if float(reservation.get("until", 0.0)) < now:
            intersection_reservations.erase(key)

    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value == null or not bool(ai_value):
            continue
        if car.has_method("is_destroyed") and car.is_destroyed():
            continue
        var info := _approaching_intersection(car)
        if info.is_empty():
            continue
        var point: Vector2 = info["point"]
        var distance := float(info["distance"])
        var signal_factor := _signal_factor(car, now)
        if signal_factor < 0.95:
            continue
        var key := "%d:%d" % [int(round(point.x)), int(round(point.y))]
        var owner := int(car.get_instance_id())
        var current: Dictionary = intersection_reservations.get(key, {})
        if current.is_empty() or float(current.get("until", 0.0)) < now or int(current.get("owner", -1)) == owner:
            if distance <= RESERVATION_DISTANCE:
                intersection_reservations[key] = {
                    "owner": owner,
                    "until": now + RESERVATION_HOLD,
                    "point": point
                }
            continue
        var factor := 0.72
        if distance < 62.0:
            factor = 0.05
        elif distance < 90.0:
            factor = 0.18
        elif distance < RESERVATION_DISTANCE:
            factor = 0.42
        var base_cruise := float(car.get_meta("build16_base_cruise", car.get("ai_cruise_speed")))
        car.set("ai_cruise_speed", min(float(car.get("ai_cruise_speed")), base_cruise * factor))
        car.set_meta("build22_reservation_brake", factor < 0.72)

func _approaching_intersection(car: Node2D) -> Dictionary:
    var forward := Vector2.UP.rotated(car.rotation).normalized()
    var side := Vector2(-forward.y, forward.x)
    var nearest := INF
    var selected := Vector2.ZERO
    for x in signal_x:
        for y in signal_y:
            var point := Vector2(x, y)
            var offset := point - car.global_position
            var along := forward.dot(offset)
            if along < 18.0 or along > 145.0:
                continue
            if abs(side.dot(offset)) > 76.0:
                continue
            if along < nearest:
                nearest = along
                selected = point
    if is_inf(nearest):
        return {}
    return {"point": selected, "distance": nearest}

func _route_police_around_blocks() -> void:
    if game == null or game.police.is_empty():
        return
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return
    for cop in game.police:
        if not is_instance_valid(cop) or not cop.has_method("set_pursuit_path"):
            continue
        if int(game.wanted_level) >= 3 and cop.global_position.distance_to(target.global_position) < 260.0:
            cop.set_pursuit_path(PackedVector2Array())
            continue
        if not _line_hits_static(cop.global_position, target.global_position, cop, target):
            cop.set_pursuit_path(PackedVector2Array())
            continue

        var cop_x := _nearest_axis(cop.global_position.x, signal_x)
        var cop_y := _nearest_axis(cop.global_position.y, signal_y)
        var target_x := _nearest_axis(target.global_position.x, signal_x)
        var target_y := _nearest_axis(target.global_position.y, signal_y)

        var path_a := PackedVector2Array([
            Vector2(cop_x, cop_y), Vector2(cop_x, target_y), Vector2(target_x, target_y)
        ])
        var path_b := PackedVector2Array([
            Vector2(cop_x, cop_y), Vector2(target_x, cop_y), Vector2(target_x, target_y)
        ])
        var chosen := path_a if _path_score(cop.global_position, path_a, target.global_position, cop, target) <= _path_score(cop.global_position, path_b, target.global_position, cop, target) else path_b
        var trimmed := PackedVector2Array()
        for waypoint in chosen:
            if cop.global_position.distance_to(waypoint) > 70.0:
                trimmed.append(waypoint)
        cop.set_pursuit_path(trimmed)

func _path_score(start: Vector2, path: PackedVector2Array, finish: Vector2, cop: CollisionObject2D, target: CollisionObject2D) -> float:
    var score := 0.0
    var previous := start
    for point in path:
        score += previous.distance_to(point)
        if _line_hits_static(previous, point, cop, target):
            score += 1400.0
        previous = point
    score += previous.distance_to(finish)
    if _line_hits_static(previous, finish, cop, target):
        score += 1400.0
    return score

func get_reserved_intersections() -> Array[Vector2]:
    var result: Array[Vector2] = []
    var now := Time.get_ticks_msec() / 1000.0
    for reservation in intersection_reservations.values():
        if reservation is Dictionary and float(reservation.get("until", 0.0)) >= now:
            var point = reservation.get("point", Vector2.ZERO)
            if point is Vector2:
                result.append(point)
    return result
