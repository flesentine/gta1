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

var vehicle_class := "SEDAN"
var body_size := Vector2(34.0, 64.0)
var skid_strength := 0.0
var impact_flash := 0.0
var class_accent := Color(0.12, 0.12, 0.14)

func _ready() -> void:
    _assign_vehicle_class()
    health = max_health
    _resize_collision()
    queue_redraw()

func _assign_vehicle_class() -> void:
    var index := int(get_instance_id() % 4)
    match index:
        0:
            vehicle_class = "COMPACT"
            body_size = Vector2(30.0, 56.0)
            acceleration = 610.0
            braking = 760.0
            rolling_drag = 285.0
            max_forward_speed = 500.0
            max_reverse_speed = 190.0
            turn_rate = 2.95
            max_health = 3
            class_accent = Color(0.80, 0.90, 0.96)
        1:
            vehicle_class = "SEDAN"
            body_size = Vector2(34.0, 64.0)
            acceleration = 510.0
            braking = 700.0
            rolling_drag = 260.0
            max_forward_speed = 525.0
            max_reverse_speed = 180.0
            turn_rate = 2.50
            max_health = 4
            class_accent = Color(0.18, 0.24, 0.28)
        2:
            vehicle_class = "MUSCLE"
            body_size = Vector2(38.0, 68.0)
            acceleration = 650.0
            braking = 740.0
            rolling_drag = 245.0
            max_forward_speed = 590.0
            max_reverse_speed = 175.0
            turn_rate = 2.20
            max_health = 5
            class_accent = Color(0.06, 0.06, 0.08)
        _:
            vehicle_class = "VAN"
            body_size = Vector2(40.0, 72.0)
            acceleration = 420.0
            braking = 660.0
            rolling_drag = 275.0
            max_forward_speed = 455.0
            max_reverse_speed = 160.0
            turn_rate = 1.95
            max_health = 6
            class_accent = Color(0.22, 0.26, 0.28)

func _resize_collision() -> void:
    var collision := get_node_or_null("CollisionShape2D") as CollisionShape2D
    if collision == null:
        return
    if collision.shape is RectangleShape2D:
        var rectangle := collision.shape as RectangleShape2D
        rectangle.size = body_size

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

func get_vehicle_class_name() -> String:
    return vehicle_class

func get_health_pair() -> Vector2i:
    return Vector2i(health, max_health)

func _physics_process(delta: float) -> void:
    hit_flash = max(hit_flash - delta, 0.0)
    impact_flash = max(impact_flash - delta, 0.0)
    skid_strength = max(skid_strength - delta * 3.2, 0.0)
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

    var impact_speed := abs(forward_speed)
    velocity = Vector2.UP.rotated(rotation) * forward_speed
    move_and_slide()

    if get_slide_collision_count() > 0:
        forward_speed *= 0.55
        stuck_time += delta
        if impact_speed > 105.0:
            impact_flash = min(0.28, 0.08 + impact_speed / 2200.0)
            queue_redraw()
    else:
        stuck_time = max(stuck_time - delta * 2.0, 0.0)

    if ai_enabled and stuck_time > 1.15:
        _skip_to_next_waypoint()
        forward_speed = ai_cruise_speed * 0.45
        stuck_time = 0.0

    if health <= max(2, int(ceil(float(max_health) * 0.5))) or skid_strength > 0.0 or impact_flash > 0.0:
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

    if abs(steer) > 0.5 and abs(forward_speed) > 255.0:
        skid_strength = min(1.0, skid_strength + delta * 8.0)
        queue_redraw()

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
    var target_speed := min(ai_cruise_speed, max_forward_speed * 0.72) * turn_slowdown
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
    if impact_flash > 0.0:
        paint = paint.lerp(Color(1.0, 0.72, 0.24), min(impact_flash * 3.0, 0.55))

    var half := body_size * 0.5
    draw_rect(Rect2(-half.x, -half.y, body_size.x, body_size.y), paint, true)

    if vehicle_class == "VAN":
        draw_rect(Rect2(-half.x + 5.0, -half.y + 10.0, body_size.x - 10.0, body_size.y * 0.42), Color(0.18, 0.24, 0.28), true)
        draw_rect(Rect2(-half.x + 6.0, 4.0, body_size.x - 12.0, body_size.y * 0.34), Color(0.08, 0.10, 0.11, 0.45), true)
    else:
        draw_rect(Rect2(-half.x + 4.0, -half.y + 16.0, body_size.x - 8.0, max(15.0, body_size.y * 0.27)), Color(0.18, 0.24, 0.28), true)
        draw_rect(Rect2(-half.x + 4.0, half.y - 24.0, body_size.x - 8.0, max(11.0, body_size.y * 0.20)), Color(0.12, 0.16, 0.18), true)

    if vehicle_class == "MUSCLE":
        draw_rect(Rect2(-3.0, -half.y + 3.0, 6.0, body_size.y - 6.0), class_accent, true)
    elif vehicle_class == "COMPACT":
        draw_rect(Rect2(-half.x + 5.0, -half.y + 8.0, body_size.x - 10.0, 5.0), Color(1.0, 1.0, 1.0, 0.18), true)

    var front_y := -half.y + 7.0
    var rear_y := half.y - 19.0
    draw_rect(Rect2(-half.x - 1.0, front_y, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(half.x - 3.0, front_y, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(-half.x - 1.0, rear_y, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(half.x - 3.0, rear_y, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)

    if skid_strength > 0.05 and controlled:
        var alpha := clamp(skid_strength * 0.42, 0.0, 0.42)
        draw_line(Vector2(-half.x * 0.55, half.y - 4.0), Vector2(-half.x * 0.55, half.y + 28.0), Color(0.02, 0.02, 0.02, alpha), 3.0)
        draw_line(Vector2(half.x * 0.55, half.y - 4.0), Vector2(half.x * 0.55, half.y + 28.0), Color(0.02, 0.02, 0.02, alpha), 3.0)

    if impact_flash > 0.0:
        var spark_alpha := clamp(impact_flash * 4.0, 0.0, 1.0)
        for i in range(6):
            var angle := float(i) * TAU / 6.0
            draw_line(Vector2.ZERO, Vector2(cos(angle), sin(angle)) * 24.0, Color(1.0, 0.62, 0.18, spark_alpha), 2.0)

    if destroyed:
        draw_circle(Vector2(-7.0, -4.0), 8.0 + sin(smoke_phase) * 2.0, Color(0.95, 0.28, 0.08, 0.78))
        draw_circle(Vector2(7.0, 4.0), 7.0 + cos(smoke_phase) * 2.0, Color(1.0, 0.62, 0.10, 0.72))
        draw_circle(Vector2(0.0, -half.y + 14.0), 9.0, Color(0.08, 0.08, 0.08, 0.70))
    elif health <= max(2, int(ceil(float(max_health) * 0.5))):
        draw_circle(Vector2(0.0, -half.y + 2.0), 6.0 + sin(smoke_phase) * 1.4, Color(0.18, 0.18, 0.18, 0.55))
        draw_circle(Vector2(4.0, -half.y - 6.0), 4.5 + cos(smoke_phase) * 1.2, Color(0.22, 0.22, 0.22, 0.45))

    draw_circle(Vector2(-half.x * 0.55, -half.y + 3.0), 2.4, Color(1.0, 0.92, 0.55))
    draw_circle(Vector2(half.x * 0.55, -half.y + 3.0), 2.4, Color(1.0, 0.92, 0.55))
