extends CharacterBody2D

@export var acceleration := 510.0
@export var braking := 700.0
@export var rolling_drag := 260.0
@export var max_forward_speed := 520.0
@export var max_reverse_speed := 180.0
@export var turn_rate := 2.5
@export var max_health := 4

var controlled := false
var ai_enabled := false
var forward_speed := 0.0
var ai_route := PackedVector2Array()
var ai_index := 0
var ai_cruise_speed := 210.0
var body_color := Color(0.78, 0.16, 0.13)
var stuck_time := 0.0
var health := 4
var destroyed := false
var hit_flash := 0.0
var smoke_phase := 0.0

func _ready() -> void:
    health = max_health
    queue_redraw()

func set_body_color(value: Color) -> void:
    body_color = value
    queue_redraw()

func set_controlled(value: bool) -> void:
    if destroyed:
        controlled = false
        return
    controlled = value
    if controlled:
        ai_enabled = false

func set_parked() -> void:
    ai_enabled = false

func configure_ai(route: PackedVector2Array, start_index: int, color: Color, cruise_speed: float = 210.0) -> void:
    ai_route = route
    ai_cruise_speed = cruise_speed
    body_color = color
    controlled = false
    ai_enabled = ai_route.size() >= 2
    forward_speed = ai_cruise_speed * 0.7
    health = max_health
    destroyed = false

    var safe_index := posmod(start_index, ai_route.size())
    global_position = ai_route[safe_index]
    ai_index = (safe_index + 1) % ai_route.size()

    var direction := (ai_route[ai_index] - global_position).normalized()
    if direction.length_squared() > 0.0:
        rotation = direction.angle() + PI * 0.5
    queue_redraw()

func take_damage(amount: int) -> void:
    if destroyed:
        return
    health -= amount
    hit_flash = 0.12
    if health <= 0:
        health = 0
        destroyed = true
        controlled = false
        ai_enabled = false
        forward_speed = 0.0
        velocity = Vector2.ZERO
    queue_redraw()

func is_destroyed() -> bool:
    return destroyed

func get_speed_ratio() -> float:
    if destroyed:
        return 0.0
    return abs(forward_speed) / max_forward_speed

func get_forward_speed_abs() -> float:
    return abs(forward_speed)

func _physics_process(delta: float) -> void:
    hit_flash = max(hit_flash - delta, 0.0)
    smoke_phase += delta * 4.0

    if destroyed:
        velocity = Vector2.ZERO
        queue_redraw()
        return

    if controlled:
        _drive(delta)
    elif ai_enabled:
        _drive_ai(delta)
    else:
        forward_speed = move_toward(forward_speed, 0.0, rolling_drag * delta)

    velocity = Vector2.UP.rotated(rotation) * forward_speed
    move_and_slide()

    if get_slide_collision_count() > 0:
        forward_speed *= 0.55
        stuck_time += delta
    else:
        stuck_time = max(stuck_time - delta * 2.0, 0.0)

    if ai_enabled and stuck_time > 1.15:
        _skip_to_next_waypoint()
        forward_speed = ai_cruise_speed * 0.45
        stuck_time = 0.0

    if health <= 2:
        queue_redraw()

func _drive(delta: float) -> void:
    var gas := Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W)
    var brake_reverse := Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S)
    var steer_left := Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A)
    var steer_right := Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D)

    var throttle := (1.0 if gas else 0.0) - (1.0 if brake_reverse else 0.0)
    var steer := (1.0 if steer_right else 0.0) - (1.0 if steer_left else 0.0)

    if throttle > 0.0:
        forward_speed = move_toward(forward_speed, max_forward_speed, acceleration * throttle * delta)
    elif throttle < 0.0:
        if forward_speed > 20.0:
            forward_speed = move_toward(forward_speed, 0.0, braking * -throttle * delta)
        else:
            forward_speed = move_toward(forward_speed, -max_reverse_speed, acceleration * 0.65 * -throttle * delta)
    else:
        forward_speed = move_toward(forward_speed, 0.0, rolling_drag * delta)

    var steering_strength := clamp(abs(forward_speed) / 120.0, 0.0, 1.0)
    if abs(forward_speed) > 4.0:
        rotation += steer * turn_rate * steering_strength * sign(forward_speed) * delta

func _drive_ai(delta: float) -> void:
    if ai_route.size() < 2:
        ai_enabled = false
        return

    var target := ai_route[ai_index]
    var to_target := target - global_position
    if to_target.length() < 86.0:
        _skip_to_next_waypoint()
        target = ai_route[ai_index]
        to_target = target - global_position

    if to_target.length_squared() <= 0.001:
        return

    var desired_rotation := to_target.normalized().angle() + PI * 0.5
    var angle_error := wrapf(desired_rotation - rotation, -PI, PI)

    var turn_slowdown := clamp(1.0 - abs(angle_error) / 2.2, 0.38, 1.0)
    var target_speed := ai_cruise_speed * turn_slowdown
    forward_speed = move_toward(forward_speed, target_speed, acceleration * 0.55 * delta)
    rotation = rotate_toward(rotation, desired_rotation, turn_rate * 0.72 * delta)

func _skip_to_next_waypoint() -> void:
    if ai_route.is_empty():
        return
    ai_index = (ai_index + 1) % ai_route.size()

func _draw() -> void:
    var paint := Color(0.13, 0.13, 0.13) if destroyed else body_color
    if hit_flash > 0.0:
        paint = paint.lerp(Color.WHITE, 0.55)

    draw_rect(Rect2(-17.0, -32.0, 34.0, 64.0), paint, true)
    draw_rect(Rect2(-13.0, -16.0, 26.0, 18.0), Color(0.18, 0.24, 0.28), true)
    draw_rect(Rect2(-13.0, 8.0, 26.0, 13.0), Color(0.12, 0.16, 0.18), true)
    draw_rect(Rect2(-18.0, -25.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(14.0, -25.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(-18.0, 12.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(14.0, 12.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)

    if destroyed:
        draw_circle(Vector2(-7.0, -4.0), 8.0 + sin(smoke_phase) * 2.0, Color(0.95, 0.28, 0.08, 0.78))
        draw_circle(Vector2(7.0, 4.0), 7.0 + cos(smoke_phase) * 2.0, Color(1.0, 0.62, 0.10, 0.72))
        draw_circle(Vector2(0.0, -18.0), 9.0, Color(0.08, 0.08, 0.08, 0.70))
    elif health <= 2:
        draw_circle(Vector2(0.0, -30.0), 6.0 + sin(smoke_phase) * 1.4, Color(0.18, 0.18, 0.18, 0.55))
        draw_circle(Vector2(4.0, -38.0), 4.5 + cos(smoke_phase) * 1.2, Color(0.22, 0.22, 0.22, 0.45))

    draw_circle(Vector2(-10.0, -30.0), 2.4, Color(1.0, 0.92, 0.55))
    draw_circle(Vector2(10.0, -30.0), 2.4, Color(1.0, 0.92, 0.55))
