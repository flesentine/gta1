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

func _physics_process(_delta: float) -> void:
    if not active:
        return

    var input_dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    velocity = input_dir * move_speed
    if input_dir.length_squared() > 0.01:
        facing = input_dir.normalized()
        queue_redraw()
    move_and_slide()

func _draw() -> void:
    draw_circle(Vector2.ZERO, 14.0, Color(0.93, 0.78, 0.36))
    draw_circle(Vector2.ZERO, 9.0, Color(0.12, 0.12, 0.12))
    draw_line(Vector2.ZERO, facing * 21.0, Color.WHITE, 4.0, true)
