extends CharacterBody2D

@export var acceleration := 620.0
@export var max_speed := 430.0
@export var turn_rate := 2.8
@export var ram_distance := 120.0

var target: Node2D = null
var forward_speed := 0.0
var pursuit_level := 1
var siren_phase := 0.0
var stuck_time := 0.0
var signal_speed_factor := 1.0
var pursuit_path := PackedVector2Array()

func _ready() -> void:
    add_to_group("police")
    add_to_group("vehicles")
    queue_redraw()

func configure(spawn_position: Vector2, new_target: Node2D, level: int) -> void:
    global_position = spawn_position
    target = new_target
    pursuit_level = clamp(level, 1, 4)
    max_speed = 350.0 + float(pursuit_level) * 38.0
    acceleration = 520.0 + float(pursuit_level) * 55.0
    forward_speed = max_speed * 0.42
    signal_speed_factor = 1.0
    pursuit_path.clear()
    queue_redraw()

func set_target(new_target: Node2D) -> void:
    target = new_target

func set_signal_speed_factor(value: float) -> void:
    signal_speed_factor = clamp(value, 0.06, 1.0)

func set_pursuit_waypoint(point: Vector2, enabled: bool = true) -> void:
    pursuit_path.clear()
    if enabled:
        pursuit_path.append(point)

func set_pursuit_path(points: PackedVector2Array) -> void:
    pursuit_path = points.duplicate()

func get_pursuit_path_size() -> int:
    return pursuit_path.size()

func get_forward_speed_abs() -> float:
    return abs(forward_speed)

func get_speed_ratio() -> float:
    return clamp(abs(forward_speed) / max_speed, 0.0, 1.0)

func is_destroyed() -> bool:
    return false

func _physics_process(delta: float) -> void:
    siren_phase += delta * 9.0
    if not is_instance_valid(target):
        pursuit_path.clear()
        forward_speed = move_toward(forward_speed, 0.0, acceleration * delta)
        velocity = Vector2.UP.rotated(rotation) * forward_speed
        move_and_slide()
        queue_redraw()
        return

    while not pursuit_path.is_empty() and global_position.distance_to(pursuit_path[0]) < 78.0:
        pursuit_path.remove_at(0)

    var pursuit_point := target.global_position
    var following_path := not pursuit_path.is_empty()
    if following_path:
        pursuit_point = pursuit_path[0]

    var to_target := pursuit_point - global_position
    if to_target.length_squared() > 0.001:
        var desired_rotation := to_target.normalized().angle() + PI * 0.5
        var angle_error := wrapf(desired_rotation - rotation, -PI, PI)
        var slowdown := clamp(1.0 - abs(angle_error) / 2.4, 0.42, 1.0)
        if following_path:
            slowdown = max(slowdown, 0.58)
        var chase_speed := max_speed * slowdown * signal_speed_factor
        if not following_path and target.global_position.distance_to(global_position) < ram_distance:
            chase_speed = max_speed * max(signal_speed_factor, 0.65)
        forward_speed = move_toward(forward_speed, chase_speed, acceleration * delta)
        rotation = rotate_toward(rotation, desired_rotation, turn_rate * delta)

    velocity = Vector2.UP.rotated(rotation) * forward_speed
    move_and_slide()

    if get_slide_collision_count() > 0:
        forward_speed *= 0.58
        stuck_time += delta
    else:
        stuck_time = max(stuck_time - delta * 2.0, 0.0)

    if stuck_time > 1.0:
        rotation += PI * 0.42
        forward_speed = max_speed * 0.38
        if not pursuit_path.is_empty():
            pursuit_path.remove_at(0)
        stuck_time = 0.0

    queue_redraw()

func _draw() -> void:
    draw_rect(Rect2(-18.0, -33.0, 36.0, 66.0), Color(0.86, 0.88, 0.90), true)
    draw_rect(Rect2(-18.0, -2.0, 36.0, 35.0), Color(0.12, 0.14, 0.18), true)
    draw_rect(Rect2(-13.0, -17.0, 26.0, 18.0), Color(0.18, 0.25, 0.31), true)
    draw_rect(Rect2(-18.0, -26.0, 4.0, 14.0), Color(0.03, 0.03, 0.04), true)
    draw_rect(Rect2(14.0, -26.0, 4.0, 14.0), Color(0.03, 0.03, 0.04), true)
    draw_rect(Rect2(-18.0, 13.0, 4.0, 14.0), Color(0.03, 0.03, 0.04), true)
    draw_rect(Rect2(14.0, 13.0, 4.0, 14.0), Color(0.03, 0.03, 0.04), true)

    var flash := sin(siren_phase) > 0.0
    draw_rect(Rect2(-11.0, -5.0, 10.0, 5.0), Color(0.95, 0.12, 0.12) if flash else Color(0.18, 0.28, 0.70), true)
    draw_rect(Rect2(1.0, -5.0, 10.0, 5.0), Color(0.18, 0.28, 0.90) if flash else Color(0.95, 0.12, 0.12), true)
    draw_circle(Vector2(-10.0, -31.0), 2.3, Color(1.0, 0.95, 0.72))
    draw_circle(Vector2(10.0, -31.0), 2.3, Color(1.0, 0.95, 0.72))

    if not pursuit_path.is_empty():
        draw_circle(Vector2(0.0, 26.0), 3.0, Color(0.22, 0.92, 0.96, 0.90))
