extends "res://scripts/mission_overlay.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or not controller.has_method("get_mission_state"):
        return
    var state: String = controller.get_mission_state()
    var target = controller.get_mission_target_vehicle()

    if state == "mixed_steal":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(0.62, 0.42, 1.0, 0.96))
    elif state == "mixed_drive":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(0.62, 0.42, 1.0, 0.72))
        _draw_drop(controller.get_mixed_drop_rect())
    elif state == "mixed_package":
        _draw_package(controller.get_mixed_package_position())
    elif state == "mixed_escape":
        _draw_escape(controller.get_escape_target_position())

func _draw_drop(rect: Rect2) -> void:
    var alpha := 0.18 + (sin(phase * 1.3) + 1.0) * 0.07
    draw_rect(rect, Color(0.58, 0.36, 0.96, alpha), true)
    draw_rect(rect, Color(0.72, 0.55, 1.0, 0.96), false, 6.0)
    draw_circle(rect.get_center(), 16.0, Color(0.72, 0.55, 1.0, 0.90))

func _draw_package(position: Vector2) -> void:
    var pulse := 1.0 + sin(phase * 1.7) * 0.10
    draw_circle(position, 38.0 * pulse, Color(1.0, 0.82, 0.22, 0.14), true)
    draw_arc(position, 34.0 * pulse, 0.0, TAU, 32, Color(1.0, 0.86, 0.25, 0.96), 4.0, true)
    draw_rect(Rect2(position - Vector2(10, 8), Vector2(20, 16)), Color(0.92, 0.68, 0.18), true)
    draw_line(position + Vector2(-10, -1), position + Vector2(10, -1), Color(0.30, 0.21, 0.08), 2.0)
