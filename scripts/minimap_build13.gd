extends "res://scripts/minimap.gd"

const BUILD13_RESPRAY_RECT := Rect2(-988, -365, 176, 130)

func _navigation_info() -> Dictionary:
    if director == null:
        return {}
    var state := str(director.mission_state)
    if state == "mixed_steal" and is_instance_valid(director.mission_target_vehicle):
        return {"label": "GETAWAY CAR", "position": director.mission_target_vehicle.global_position}
    if state == "mixed_drive":
        return {"label": "DROP CAR", "position": director.get_mixed_drop_rect().get_center()}
    if state == "mixed_package":
        return {"label": "PACKAGE", "position": director.get_mixed_package_position()}
    if state == "mixed_escape":
        return {"label": "LOSE HEAT", "position": BUILD13_RESPRAY_RECT.get_center()}
    return super._navigation_info()
