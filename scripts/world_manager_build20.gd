extends "res://scripts/world_manager_build19.gd"

const LANE_OFFSET := 26.0
const LANE_CHANGE_SPEED := 42.0
const LANE_CHANGE_COOLDOWN := 6.0
const LANE_CHANGE_BLOCK_DISTANCE := 105.0

func _pace_traffic() -> void:
    var now := Time.get_ticks_msec() / 1000.0
    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value == null or not bool(ai_value):
            continue
        if car.has_method("is_destroyed") and car.is_destroyed():
            continue

        _ensure_lane_state(car, now)
        _update_lane_route(car, now)

        if not car.has_meta("build16_base_cruise"):
            car.set_meta("build16_base_cruise", float(car.get("ai_cruise_speed")))

        var spacing_factor := _lane_traffic_factor(car)
        var signal_factor := _signal_factor(car, now)
        var factor := min(spacing_factor, signal_factor)
        var base_cruise := float(car.get_meta("build16_base_cruise", 200.0))
        car.set("ai_cruise_speed", base_cruise * factor)
        car.set_meta("build16_braking", factor < 0.72)
        car.set_meta("build19_signal_brake", signal_factor < 0.72)

        if spacing_factor <= 0.30:
            _try_lane_change(car, now)

    _coordinate_police_signals(now)

func _ensure_lane_state(car: Node, now: float) -> void:
    if car.has_meta("build20_lane_base"):
        return
    var route_value = car.get("ai_route")
    if not route_value is PackedVector2Array:
        return
    var base_route: PackedVector2Array = route_value.duplicate()
    if base_route.size() < 2:
        return
    var side := -1.0 if int(car.get_instance_id()) % 2 == 0 else 1.0
    car.set_meta("build20_lane_base", base_route)
    car.set_meta("build20_lane_side", side)
    car.set_meta("build20_lane_target", side)
    car.set_meta("build20_lane_offset", side * LANE_OFFSET)
    car.set_meta("build20_lane_cooldown", now + float(car.get_instance_id() % 5) * 0.35)

func _update_lane_route(car: Node, now: float) -> void:
    if not car.has_meta("build20_lane_base"):
        return
    var current := float(car.get_meta("build20_lane_offset", 0.0))
    var target_side := float(car.get_meta("build20_lane_target", 1.0))
    var target := target_side * LANE_OFFSET
    var next_offset := move_toward(current, target, LANE_CHANGE_SPEED * 0.20)
    car.set_meta("build20_lane_offset", next_offset)

    var base_route = car.get_meta("build20_lane_base")
    if not base_route is PackedVector2Array:
        return
    var shifted := PackedVector2Array()
    for i in range(base_route.size()):
        shifted.append(_offset_route_point(base_route, i, next_offset))
    car.set("ai_route", shifted)

func _offset_route_point(route: PackedVector2Array, index: int, offset: float) -> Vector2:
    if route.size() < 2:
        return route[index]
    var previous := route[(index - 1 + route.size()) % route.size()]
    var current := route[index]
    var direction := (current - previous).normalized()
    if direction.length_squared() <= 0.001:
        return current
    var side := Vector2(-direction.y, direction.x)
    return current + side * offset

func _lane_traffic_factor(car: Node2D) -> float:
    var forward := Vector2.UP.rotated(car.rotation).normalized()
    var side := Vector2(-forward.y, forward.x)
    var nearest := INF
    for other in game.vehicles:
        if not is_instance_valid(other) or other == car:
            continue
        if other.has_method("is_destroyed") and other.is_destroyed():
            continue
        var offset: Vector2 = other.global_position - car.global_position
        var along := forward.dot(offset)
        if along < 1.0 or along > 185.0:
            continue
        if abs(side.dot(offset)) > 42.0:
            continue
        nearest = min(nearest, along)
    if nearest < 54.0:
        return 0.08
    if nearest < 88.0:
        return 0.30
    if nearest < 128.0:
        return 0.58
    if nearest < 165.0:
        return 0.78
    return 1.0

func _try_lane_change(car: Node2D, now: float) -> void:
    if not car.has_meta("build20_lane_base"):
        return
    if now < float(car.get_meta("build20_lane_cooldown", 0.0)):
        return
    if _distance_to_next_intersection(car) < 180.0:
        return
    var current_side := float(car.get_meta("build20_lane_target", 1.0))
    var target_side := -current_side
    if not _adjacent_lane_clear(car, target_side):
        car.set_meta("build20_lane_cooldown", now + 1.5)
        return
    car.set_meta("build20_lane_target", target_side)
    car.set_meta("build20_lane_side", target_side)
    car.set_meta("build20_lane_cooldown", now + LANE_CHANGE_COOLDOWN)

func _adjacent_lane_clear(car: Node2D, target_side: float) -> bool:
    var forward := Vector2.UP.rotated(car.rotation).normalized()
    var side := Vector2(-forward.y, forward.x)
    var desired_lateral := target_side * LANE_OFFSET
    var current_lateral := float(car.get_meta("build20_lane_offset", 0.0))
    var shift := desired_lateral - current_lateral
    for other in game.vehicles:
        if not is_instance_valid(other) or other == car:
            continue
        if other.has_method("is_destroyed") and other.is_destroyed():
            continue
        var offset: Vector2 = other.global_position - car.global_position
        var along := forward.dot(offset)
        var lateral := side.dot(offset)
        if along < -95.0 or along > 135.0:
            continue
        if abs(lateral - shift) < 38.0:
            return false
    return true

func _distance_to_next_intersection(car: Node2D) -> float:
    var forward := Vector2.UP.rotated(car.rotation).normalized()
    var side := Vector2(-forward.y, forward.x)
    var nearest := INF
    for x in signal_x:
        for y in signal_y:
            var offset := Vector2(x, y) - car.global_position
            var along := forward.dot(offset)
            if along < 0.0 or along > 260.0:
                continue
            if abs(side.dot(offset)) > 90.0:
                continue
            nearest = min(nearest, along)
    return nearest

func get_red_signal_violation(car: Node2D, min_speed: float = 95.0) -> bool:
    if not is_instance_valid(car):
        return false
    var speed := 0.0
    if car.has_method("get_forward_speed_abs"):
        speed = float(car.get_forward_speed_abs())
    elif car.get("forward_speed") != null:
        speed = abs(float(car.get("forward_speed")))
    if speed < min_speed:
        return false
    var now := Time.get_ticks_msec() / 1000.0
    var factor := _signal_factor(car, now)
    return factor <= 0.22 and _distance_to_next_intersection(car) < 72.0

func _coordinate_police_signals(now: float) -> void:
    if game == null:
        return
    var wanted := int(game.wanted_level)
    for cop in game.police:
        if not is_instance_valid(cop) or not cop.has_method("set_signal_speed_factor"):
            continue
        if wanted >= 3:
            cop.set_signal_speed_factor(1.0)
            continue
        cop.set_signal_speed_factor(_signal_factor(cop, now))
