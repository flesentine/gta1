extends CharacterBody2D

@export var acceleration := 510.0
@export var braking := 700.0
@export var rolling_drag := 260.0
@export var max_forward_speed := 520.0
@export var max_reverse_speed := 180.0
@export var turn_rate := 2.5

var controlled := false
var forward_speed := 0.0

func _ready() -> void:
    queue_redraw()

func set_controlled(value: bool) -> void:
    controlled = value

func get_speed_ratio() -> float:
    return abs(forward_speed) / max_forward_speed

func get_forward_speed_abs() -> float:
    return abs(forward_speed)

func _physics_process(delta: float) -> void:
    if controlled:
        _drive(delta)
    else:
        forward_speed = move_toward(forward_speed, 0.0, rolling_drag * delta)

    velocity = Vector2.UP.rotated(rotation) * forward_speed
    move_and_slide()

    # Bleed speed after hard impacts so walls do not become infinite accelerators.
    if get_slide_collision_count() > 0:
        forward_speed *= 0.72

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

func _draw() -> void:
    # Placeholder art: body points upward in local space.
    draw_rect(Rect2(-17.0, -32.0, 34.0, 64.0), Color(0.78, 0.16, 0.13), true)
    draw_rect(Rect2(-13.0, -16.0, 26.0, 18.0), Color(0.18, 0.24, 0.28), true)
    draw_rect(Rect2(-13.0, 8.0, 26.0, 13.0), Color(0.12, 0.16, 0.18), true)
    draw_rect(Rect2(-18.0, -25.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(14.0, -25.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(-18.0, 12.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
    draw_rect(Rect2(14.0, 12.0, 4.0, 14.0), Color(0.04, 0.04, 0.04), true)
