extends "res://scripts/mission_overlay_build15.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null:
        return
    var state := str(controller.mission_state)
    var target = controller.get_mission_target_vehicle()

    if state == "branch_steal":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(1.0, 0.64, 0.14, 0.98))
    elif state == "branch_choose":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(1.0, 0.64, 0.14, 0.62))
        _draw_branch_gate(controller.get_branch_quiet_gate(), Color(0.18, 0.92, 0.42, 0.98))
        _draw_branch_gate(controller.get_branch_hot_gate(), Color(1.0, 0.20, 0.24, 0.98))
    elif state == "branch_deliver":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(1.0, 0.64, 0.14, 0.58))
        var route_color := Color(1.0, 0.25, 0.28, 0.96) if controller.get_branch_choice() == "hot" else Color(0.22, 0.94, 0.46, 0.96)
        _draw_branch_delivery(controller.get_branch_delivery_rect(), route_color)
    elif state == "branch_escape":
        _draw_escape(controller.get_escape_target_position())

func _draw_branch_gate(position: Vector2, color: Color) -> void:
    var pulse := 1.0 + sin(phase * 1.7) * 0.10
    var halo := color
    halo.a = 0.13
    draw_circle(position, 58.0 * pulse, halo, true)
    draw_arc(position, 50.0 * pulse, 0.0, TAU, 36, color, 5.0, true)
    draw_circle(position, 8.0, color, true)

func _draw_branch_delivery(rect: Rect2, color: Color) -> void:
    var fill := color
    fill.a = 0.18 + (sin(phase * 1.25) + 1.0) * 0.05
    draw_rect(rect, fill, true)
    draw_rect(rect, color, false, 6.0)
    draw_circle(rect.get_center(), 14.0, color, true)
