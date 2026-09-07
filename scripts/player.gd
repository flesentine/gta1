extends CharacterBody2D

@export var move_speed := 225.0

var active := true
var facing := Vector2.UP

func _ready() -> void:
    queue_redraw()

func set_active(value: bool) -> void:
    active = value
    velocity = Vector2.ZERO
    set_physics_process(value)

func get_facing() -> Vector2:
    return facing

func _physics_process(_delta: float) -> void:
    if not active:
        return

    var left := 1.0 if Input.is_action_pressed("ui_left") or Input.is_key_pressed(KEY_A) else 0.0
    var right := 1.0 if Input.is_action_pressed("ui_right") or Input.is_key_pressed(KEY_D) else 0.0
    var up := 1.0 if Input.is_action_pressed("ui_up") or Input.is_key_pressed(KEY_W) else 0.0
    var down := 1.0 if Input.is_action_pressed("ui_down") or Input.is_key_pressed(KEY_S) else 0.0
    var input_dir := Vector2(right - left, down - up).normalized()

    velocity = input_dir * move_speed
    if input_dir.length_squared() > 0.01:
        facing = input_dir
        queue_redraw()
    move_and_slide()

func _draw() -> void:
    draw_circle(Vector2.ZERO, 14.0, Color(0.93, 0.78, 0.36))
    draw_circle(Vector2.ZERO, 9.0, Color(0.12, 0.12, 0.12))
    draw_line(Vector2.ZERO, facing * 21.0, Color.WHITE, 4.0, true)
