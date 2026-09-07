extends "res://scripts/world_manager_build22.gd"

const MOVEMENT_RESERVATION_HOLD := 1.20
const MOVEMENT_RESERVATION_DISTANCE := 122.0
const PREDICTION_LEAD_LOW := 1.35
const PREDICTION_LEAD_HIGH := 1.65

var movement_reservations: Dictionary = {}

func _apply_intersection_reservations() -> void:
    if game == null:
        return
    intersection_reservations.clear()
    var now := Time.get_ticks_msec() / 1000.0
    for key in movement_reservations.keys().duplicate():
        var kept: Array = []
        for item in movement_reservations[key]:
            if item is Dictionary and float(item.get("until", 0.0)) >= now:
                kept.append(item)
        if kept.is_empty():
            movement_reservations.erase(key)
        else:
            movement_reservations[key] = kept

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
        if _signal_factor(car, now) < 0.95:
            continue

        var movement := _movement_for(car)
        var key := "%d:%d" % [int(round(point.x)), int(round(point.y))]
        var owner := int(car.get_instance_id())
        var entries: Array = movement_reservations.get(key, [])
        var blocked := false
        for entry in entries:
            if not entry is Dictionary:
                continue
            if int(entry.get("owner", -1)) == owner:
                continue
            if _movements_conflict(movement, str(entry.get("movement", ""))):
                blocked = true
                break

        if not blocked:
            if distance <= MOVEMENT_RESERVATION_DISTANCE:
                var updated := false
                for i in range(entries.size()):
                    var entry = entries[i]
                    if entry is Dictionary and int(entry.get("owner", -1)) == owner:
                        entries[i] = {
                            "owner": owner,
                            "movement": movement,
                            "until": now + MOVEMENT_RESERVATION_HOLD,
                            "point": point
                        }
                        updated = true
                        break
                if not updated:
                    entries.append({
                        "owner": owner,
                        "movement": movement,
                        "until": now + MOVEMENT_RESERVATION_HOLD,
                        "point": point
                    })
                movement_reservations[key] = entries
            car.set_meta("build23_conflict_brake", false)
            continue

        var factor := 0.72
        if distance < 62.0:
            factor = 0.05
        elif distance < 90.0:
            factor = 0.18
        elif distance < MOVEMENT_RESERVATION_DISTANCE:
            factor = 0.42
        var base_cruise := float(car.get_meta("build16_base_cruise", car.get("ai_cruise_speed")))
        car.set("ai_cruise_speed", min(float(car.get("ai_cruise_speed")), base_cruise * factor))
        car.set_meta("build23_conflict_brake", factor < 0.72)

func _movement_for(car: Node2D) -> String:
    var forward := Vector2.UP.rotated(car.rotation).normalized()
    var approach := "E" if abs(forward.x) >= abs(forward.y) and forward.x >= 0.0 else "W" if abs(forward.x) >= abs(forward.y) else "S" if forward.y >= 0.0 else "N"
    var turn := "S"
    var route_value = car.get_meta("build20_lane_base", car.get("ai_route"))
    if route_value is PackedVector2Array and route_value.size() >= 3:
        var route: PackedVector2Array = route_value
        var index := posmod(int(car.get("ai_index")), route.size())
        var corner := route[index]
        var next_point := route[(index + 1) % route.size()]
        var outgoing := (next_point - corner).normalized()
        if outgoing.length_squared() > 0.001:
            var dot := forward.dot(outgoing)
            if dot <= 0.82:
                turn = "R" if forward.cross(outgoing) > 0.0 else "L"
    return approach + turn

func _movements_conflict(a: String, b: String) -> bool:
    if a.length() < 2 or b.length() < 2:
        return true
    var aa := a.substr(0, 1)
    var at := a.substr(1, 1)
    var ba := b.substr(0, 1)
    var bt := b.substr(1, 1)
    if aa == ba:
        return true
    if at == "S" and bt == "S" and _opposite_approach(aa) == ba:
        return false
    if at == "R" and bt == "R":
        return false
    if _opposite_approach(aa) == ba and ((at == "S" and bt == "R") or (at == "R" and bt == "S")):
        return false
    return true

func _opposite_approach(value: String) -> String:
    match value:
        "N": return "S"
        "S": return "N"
        "E": return "W"
        "W": return "E"
    return ""

func _route_police_around_blocks() -> void:
    if game == null or game.police.is_empty():
        return
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return
    var intercept := _predict_target_position(target)
    for cop in game.police:
        if not is_instance_valid(cop) or not cop.has_method("set_pursuit_path"):
            continue
        var distance_to_target := cop.global_position.distance_to(target.global_position)
        if int(game.wanted_level) >= 3 and distance_to_target < 230.0:
            cop.set_pursuit_path(PackedVector2Array())
            continue
        if not _line_hits_static(cop.global_position, intercept, cop, target):
            cop.set_pursuit_path(PackedVector2Array([intercept]))
            continue

        var cop_x := _nearest_axis(cop.global_position.x, signal_x)
        var cop_y := _nearest_axis(cop.global_position.y, signal_y)
        var target_x := _nearest_axis(intercept.x, signal_x)
        var target_y := _nearest_axis(intercept.y, signal_y)
        var path_a := PackedVector2Array([
            Vector2(cop_x, cop_y), Vector2(cop_x, target_y), Vector2(target_x, target_y), intercept
        ])
        var path_b := PackedVector2Array([
            Vector2(cop_x, cop_y), Vector2(target_x, cop_y), Vector2(target_x, target_y), intercept
        ])
        var chosen := path_a if _path_score(cop.global_position, path_a, intercept, cop, target) <= _path_score(cop.global_position, path_b, intercept, cop, target) else path_b
        var trimmed := PackedVector2Array()
        for waypoint in chosen:
            if cop.global_position.distance_to(waypoint) > 70.0:
                trimmed.append(waypoint)
        cop.set_pursuit_path(trimmed)

func _predict_target_position(target: Node2D) -> Vector2:
    var lead := PREDICTION_LEAD_HIGH if int(game.wanted_level) >= 3 else PREDICTION_LEAD_LOW
    var velocity := Vector2.ZERO
    if target is CharacterBody2D:
        velocity = target.velocity
    var prediction := target.global_position + velocity * lead
    var max_lead := 560.0
    var delta := prediction - target.global_position
    if delta.length() > max_lead:
        prediction = target.global_position + delta.normalized() * max_lead
    return prediction

func get_reserved_intersections() -> Array[Vector2]:
    var result: Array[Vector2] = []
    var seen := {}
    var now := Time.get_ticks_msec() / 1000.0
    for entries in movement_reservations.values():
        if not entries is Array:
            continue
        for entry in entries:
            if not entry is Dictionary or float(entry.get("until", 0.0)) < now:
                continue
            var point = entry.get("point", Vector2.ZERO)
            if not point is Vector2:
                continue
            var key := "%d:%d" % [int(round(point.x)), int(round(point.y))]
            if seen.has(key):
                continue
            seen[key] = true
            result.append(point)
    return result
