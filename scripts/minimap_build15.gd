extends "res://scripts/minimap_build13.gd"

func _navigation_info() -> Dictionary:
    if director != null:
        var state := str(director.mission_state)
        if state == "hunt_target":
            var target = director.get_character_target()
            if is_instance_valid(target):
                return {"label": "MARKED TARGET", "position": target.global_position}
        if state == "hunt_escape":
            return {"label": "LOSE HEAT", "position": RESPRAY_RECT.get_center()}
    return super._navigation_info()
