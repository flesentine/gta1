extends "res://scripts/world_manager_build23.gd"

const ROADBLOCK_VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")
const ROADBLOCK_LIFETIME := 11.0
const ROADBLOCK_COOLDOWN := 12.0
const ROADBLOCK_MIN_DISTANCE := 320.0
const ROADBLOCK_MAX_DISTANCE := 1350.0

var roadblock_vehicles: Array[CharacterBody2D] = []
var roadblock_lifetime := 0.0
var roadblock_cooldown := 3.0

func _process(delta: float) -> void:
    super._process(delta)
    _update_roadblocks(delta)

func _route_police_around_blocks() -> void:
    if game == null or game.police.is_empty():
        return
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return
    var intercept := _predict_target_position(target)
    var motion := _target_motion24(target)
    var side := Vector2(-motion.y, motion.x)

    for i in range(game.police.size()):
        var cop = game.police[i]
        if not is_instance_valid(cop) or not cop.has_method("set_pursuit_path"):
            continue
        var role := i % 3
        var aim := intercept
        if role == 1:
            aim += side * 520.0
            cop.set_meta("build24_role", "FLANK A")
        elif role == 2:
            aim -= side * 520.0
            cop.set_meta("build24_role", "FLANK B")
        else:
            cop.set_meta("build24_role", "CHASE")

        var world_rect := Rect2(-2400.0, -1700.0, 7800.0, 3400.0)
        aim.x = clamp(aim.x, world_rect.position.x + 60.0, world_rect.end.x - 60.0)
        aim.y = clamp(aim.y, world_rect.position.y + 60.0, world_rect.end.y - 60.0)

        if int(game.wanted_level) >= 3 and cop.global_position.distance_to(target.global_position) < 210.0:
            cop.set_pursuit_path(PackedVector2Array())
            continue
        cop.set_pursuit_path(_route_to_point24(cop, aim, target))

func _route_to_point24(cop: CollisionObject2D, aim: Vector2, target: CollisionObject2D) -> PackedVector2Array:
    if not _line_hits_static(cop.global_position, aim, cop, target):
        return PackedVector2Array([aim])
    var cop_x := _nearest_axis(cop.global_position.x, signal_x)
    var cop_y := _nearest_axis(cop.global_position.y, signal_y)
    var target_x := _nearest_axis(aim.x, signal_x)
    var target_y := _nearest_axis(aim.y, signal_y)
    var path_a := PackedVector2Array([
        Vector2(cop_x, cop_y), Vector2(cop_x, target_y), Vector2(target_x, target_y), aim
    ])
    var path_b := PackedVector2Array([
        Vector2(cop_x, cop_y), Vector2(target_x, cop_y), Vector2(target_x, target_y), aim
    ])
    var chosen := path_a if _path_score(cop.global_position, path_a, aim, cop, target) <= _path_score(cop.global_position, path_b, aim, cop, target) else path_b
    var trimmed := PackedVector2Array()
    for waypoint in chosen:
        if cop.global_position.distance_to(waypoint) > 70.0:
            trimmed.append(waypoint)
    return trimmed

func _target_motion24(target: Node2D) -> Vector2:
    if target is CharacterBody2D:
        var v := (target as CharacterBody2D).velocity
        if v.length() > 20.0:
            return v.normalized()
    return Vector2.RIGHT

func _update_roadblocks(delta: float) -> void:
    if game == null:
        return
    roadblock_cooldown = max(roadblock_cooldown - delta, 0.0)
    if not roadblock_vehicles.is_empty():
        roadblock_lifetime = max(roadblock_lifetime - delta, 0.0)
        if roadblock_lifetime <= 0.0 or int(game.wanted_level) < 3:
            _clear_roadblock24()
    if int(game.wanted_level) >= 3 and roadblock_vehicles.is_empty() and roadblock_cooldown <= 0.0:
        _spawn_roadblock24()

func _spawn_roadblock24() -> void:
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return
    var motion := _target_motion24(target)
    var predicted := _predict_target_position(target)
    var horizontal := abs(motion.x) >= abs(motion.y)
    var point := Vector2.ZERO
    if horizontal:
        point.x = _axis_ahead24(predicted.x, signal_x, 1 if motion.x >= 0.0 else -1)
        point.y = _nearest_axis(target.global_position.y, signal_y)
    else:
        point.x = _nearest_axis(target.global_position.x, signal_x)
        point.y = _axis_ahead24(predicted.y, signal_y, 1 if motion.y >= 0.0 else -1)
    var distance := target.global_position.distance_to(point)
    if distance < ROADBLOCK_MIN_DISTANCE or distance > ROADBLOCK_MAX_DISTANCE:
        roadblock_cooldown = 2.0
        return

    var offsets := [Vector2(0.0, -43.0), Vector2(0.0, 43.0)] if horizontal else [Vector2(-43.0, 0.0), Vector2(43.0, 0.0)]
    var rotation_value := 0.0 if horizontal else PI * 0.5
    for offset in offsets:
        var car = ROADBLOCK_VEHICLE_SCRIPT.new()
        car.name = "PoliceRoadblock24"
        var collision := CollisionShape2D.new()
        var shape := RectangleShape2D.new()
        shape.size = Vector2(38.0, 68.0)
        collision.shape = shape
        car.add_child(collision)
        game.add_child(car)
        car.global_position = point + offset
        car.rotation = rotation_value
        car.set_body_color(Color(0.10, 0.12, 0.14))
        car.set_parked()
        car.set_meta("build24_roadblock", true)
        car.add_to_group("vehicles")
        game.vehicles.append(car)
        roadblock_vehicles.append(car)
    roadblock_lifetime = ROADBLOCK_LIFETIME
    roadblock_cooldown = ROADBLOCK_COOLDOWN
    game.status_message = "POLICE ROADBLOCK DEPLOYED AHEAD"
    game.status_timer = 2.0

func _clear_roadblock24() -> void:
    for car in roadblock_vehicles:
        if not is_instance_valid(car):
            continue
        game.vehicles.erase(car)
        car.queue_free()
    roadblock_vehicles.clear()
    roadblock_lifetime = 0.0

func _axis_ahead24(value: float, values: Array[float], direction: int) -> float:
    if values.is_empty():
        return value
    var sorted := values.duplicate()
    sorted.sort()
    var best_index := 0
    var best := INF
    for i in range(sorted.size()):
        var d := abs(sorted[i] - value)
        if d < best:
            best = d
            best_index = i
    return sorted[clampi(best_index + direction, 0, sorted.size() - 1)]

func get_roadblock_count() -> int:
    return roadblock_vehicles.size()
