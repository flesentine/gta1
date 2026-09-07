extends "res://scripts/mission_overlay_build13.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null:
        return
    var state := str(controller.mission_state)
    if state == "hunt_target":
        var target = controller.get_character_target()
        if is_instance_valid(target):
            _draw_target(target.global_position, Color(1.0, 0.18, 0.24, 0.98))
    elif state == "hunt_escape":
        _draw_escape(controller.get_escape_target_position())
