extends "res://scripts/mission_overlay_build17.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "hot_swap":
        return
    var state := str(controller.mission_state)
    var target = controller.get_mission_target_vehicle()
    var teal := Color(0.20, 0.86, 0.88, 0.98)

    if state == "swap_steal":
        if is_instance_valid(target):
            _draw_target(target.global_position, teal)
    elif state == "swap_drive":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(0.20, 0.86, 0.88, 0.60))
        _draw_branch_gate(controller.get_hot_swap_current_checkpoint(), teal)
    elif state == "swap_handoff":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(0.20, 0.86, 0.88, 0.55))
        _draw_branch_delivery(controller.get_hot_swap_handoff_rect(), teal)
    elif state == "swap_package":
        var package := controller.get_hot_swap_package_position()
        var pulse := 13.0 + sin(phase * 2.0) * 3.0
        draw_circle(package, pulse, Color(0.96, 0.78, 0.22, 0.96), true)
        draw_arc(package, 24.0 + sin(phase) * 4.0, 0.0, TAU, 32, Color(1.0, 0.88, 0.38, 0.90), 3.0, true)
    elif state == "swap_escape_steal":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(0.96, 0.96, 0.98, 0.98))
    elif state == "swap_escape":
        _draw_escape(controller.get_escape_target_position())
    elif state == "swap_deliver":
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(0.70, 0.96, 0.78, 0.62))
        _draw_branch_delivery(controller.get_hot_swap_final_delivery(), Color(0.24, 0.92, 0.48, 0.98))
