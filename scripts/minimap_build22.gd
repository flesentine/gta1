extends "res://scripts/minimap_build18.gd"

func _navigation_info() -> Dictionary:
    if director != null and str(director.current_mission.get("id", "")) == "hot_swap":
        var state := str(director.mission_state)
        if state == "swap_steal" and is_instance_valid(director.mission_target_vehicle):
            return {"label": "TEAL COURIER", "position": director.mission_target_vehicle.global_position}
        if state == "swap_drive":
            return {"label": "HARBOR GATE", "position": director.get_hot_swap_current_checkpoint()}
        if state == "swap_handoff":
            return {"label": "HANDOFF LOT", "position": director.get_hot_swap_handoff_rect().get_center()}
        if state == "swap_package":
            return {"label": "PACKAGE", "position": director.get_hot_swap_package_position()}
        if state == "swap_escape_steal" and is_instance_valid(director.get_hot_swap_escape_vehicle()):
            return {"label": "ESCAPE CAR", "position": director.get_hot_swap_escape_vehicle().global_position}
        if state == "swap_escape":
            return {"label": "LOSE HEAT", "position": BUILD13_RESPRAY_RECT.get_center()}
        if state == "swap_deliver":
            return {"label": "SAFEHOUSE", "position": director.get_hot_swap_final_delivery().get_center()}
    return super._navigation_info()
