extends "res://scripts/world_manager_build20.gd"

const TURN_APPROACH := 190.0

func _pace_traffic() -> void:
    _prepare_turn_pockets()
    super._pace_traffic()
    _route_police_around_blocks()

func _prepare_turn_pockets() -> void:
    var now := Time.get_ticks_msec() / 1000.0
    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value == null or not bool(ai_value):
            continue
        _ensure_lane_state(car, now)
        if not car.has_meta("build20_lane_base"):
            continue
        var route = car.get_meta("build20_lane_base")
        if not route is PackedVector2Array or route.size() < 3:
            continue
        var index := int(car.get("ai_index"))
        index = posmod(index, route.size())
        var turn_point: Vector2 = route[index]
        var next_point: Vector2 = route[(index + 1) % route.size()]
        var distance := car.global_position.distance_to(turn_point)
        if distance > TURN_APPROACH:
            car.set_meta("build21_turn_pocket", false)
            continue
        var forward := Vector2.UP.rotated(car.rotation).normalized()
        var outgoing := (next_point - turn_point).normalized()
        if outgoing.length_squared() <= 0.001 or forward.dot(outgoing) > 0.82:
            car.set_meta("build21_turn_pocket", false)
            continue
        var cross := forward.cross(outgoing)
        car.set_meta("build20_lane_target", 1.0 if cross > 0.0 else -1.0)
        car.set_meta("build21_turn_pocket", true)

func _route_police_around_blocks() -> void:
    if game == null or game.police.is_empty():
        return
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return
    for cop in game.police:
        if not is_instance_valid(cop) or not cop.has_method("set_pursuit_waypoint"):
            continue
        if int(game.wanted_level) >= 3 and cop.global_position.distance_to(target.global_position) < 260.0:
            cop.set_pursuit_waypoint(Vector2.ZERO, false)
            continue
        if not _line_hits_static(cop.global_position, target.global_position, cop, target):
            cop.set_pursuit_waypoint(Vector2.ZERO, false)
            continue
        var cop_x := _nearest_axis(cop.global_position.x, signal_x)
        var cop_y := _nearest_axis(cop.global_position.y, signal_y)
        var target_x := _nearest_axis(target.global_position.x, signal_x)
        var target_y := _nearest_axis(target.global_position.y, signal_y)
        var option_a := Vector2(target_x, cop_y)
        var option_b := Vector2(cop_x, target_y)
        var waypoint := option_a if cop.global_position.distance_to(option_a) <= cop.global_position.distance_to(option_b) else option_b
        cop.set_pursuit_waypoint(waypoint, true)

func _nearest_axis(value: float, values: Array[float]) -> float:
    if values.is_empty():
        return value
    var result := values[0]
    var best := abs(result - value)
    for candidate in values:
        var distance := abs(candidate - value)
        if distance < best:
            best = distance
            result = candidate
    return result

func _line_hits_static(start: Vector2, finish: Vector2, exclude_a: CollisionObject2D, exclude_b: CollisionObject2D) -> bool:
    var query := PhysicsRayQueryParameters2D.create(start, finish)
    query.exclude = [exclude_a.get_rid(), exclude_b.get_rid()]
    var hit := game.get_world_2d().direct_space_state.intersect_ray(query)
    if hit.is_empty():
        return false
    var collider = hit.get("collider")
    return collider is StaticBody2D
