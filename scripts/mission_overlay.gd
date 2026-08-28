extends Node2D

var phase := 0.0

func _ready() -> void:
    z_index = 8
    queue_redraw()

func _process(delta: float) -> void:
    phase += delta * 3.0
    queue_redraw()

func _draw() -> void:
    var controller := get_parent()
    if controller == null or not controller.has_method("get_mission_state"):
        return

    var state: String = controller.get_mission_state()
    var phone: Vector2 = controller.get_mission_phone_position()
    var delivery: Rect2 = controller.get_mission_delivery_rect()
    var target = controller.get_mission_target_vehicle()

    if state == "available":
        _draw_phone(phone)
    elif state == "steal" or state == "deliver":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(1.0, 0.84, 0.18, 0.95))
        if state == "deliver":
            _draw_delivery(delivery)
    elif state == "destroy":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(1.0, 0.28, 0.12, 0.96))
    elif state == "escape":
        _draw_escape(controller.get_escape_target_position())

func _draw_phone(position: Vector2) -> void:
    var pulse := 1.0 + sin(phase) * 0.08
    draw_circle(position, 29.0 * pulse, Color(0.12, 0.72, 0.96, 0.20))
    draw_circle(position, 22.0, Color(0.08, 0.48, 0.72, 0.92))
    draw_arc(position, 13.0, 0.45, 2.70, 18, Color.WHITE, 5.0, true)
    draw_circle(position + Vector2(-9, 8), 4.0, Color.WHITE)
    draw_circle(position + Vector2(9, -8), 4.0, Color.WHITE)

func _draw_target(position: Vector2, marker_color: Color) -> void:
    var pulse := 1.0 + sin(phase * 1.4) * 0.10
    var halo := marker_color
    halo.a = 0.14
    draw_circle(position, 42.0 * pulse, halo)
    draw_arc(position, 38.0 * pulse, 0.0, TAU, 32, marker_color, 4.0, true)
    var arrow_y := -58.0 - sin(phase * 1.6) * 7.0
    var arrow := PackedVector2Array([
        position + Vector2(-10, arrow_y - 14),
        position + Vector2(10, arrow_y - 14),
        position + Vector2(0, arrow_y)
    ])
    draw_colored_polygon(arrow, marker_color)

func _draw_delivery(rect: Rect2) -> void:
    var alpha := 0.22 + (sin(phase * 1.25) + 1.0) * 0.08
    draw_rect(rect, Color(0.96, 0.76, 0.12, alpha), true)
    draw_rect(rect, Color(1.0, 0.86, 0.24, 0.95), false, 6.0)
    var center := rect.get_center()
    draw_circle(center, 18.0, Color(1.0, 0.86, 0.24, 0.92))
    draw_circle(center, 9.0, Color(0.10, 0.10, 0.10, 0.9))

func _draw_escape(position: Vector2) -> void:
    var pulse := 1.0 + sin(phase * 1.7) * 0.12
    draw_arc(position, 52.0 * pulse, 0.0, TAU, 36, Color(1.0, 0.30, 0.16, 0.72), 4.0, true)
    draw_arc(position, 66.0 * pulse, 0.0, TAU, 36, Color(0.20, 0.55, 1.0, 0.42), 3.0, true)
