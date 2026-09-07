extends "res://scripts/minimap_build15.gd"

func _navigation_info() -> Dictionary:
    if director != null:
        var state := str(director.mission_state)
        if state == "branch_steal" and is_instance_valid(director.mission_target_vehicle):
            return {"label": "RUNNER CAR", "position": director.mission_target_vehicle.global_position}
        if state == "branch_choose":
            return {"label": "CHOOSE GREEN / RED", "position": (director.get_branch_quiet_gate() + director.get_branch_hot_gate()) * 0.5}
        if state == "branch_deliver":
            var label := "HOT DELIVERY" if director.get_branch_choice() == "hot" else "QUIET DELIVERY"
            return {"label": label, "position": director.get_branch_delivery_rect().get_center()}
        if state == "branch_escape":
            return {"label": "LOSE HEAT", "position": BUILD13_RESPRAY_RECT.get_center()}
    return super._navigation_info()

func _draw() -> void:
    super._draw()
    if director == null or str(director.mission_state) != "branch_choose":
        return
    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)
    var quiet := _map_point(director.get_branch_quiet_gate(), scale)
    var hot := _map_point(director.get_branch_hot_gate(), scale)
    draw_circle(quiet, 5.0, Color(0.18, 0.94, 0.42), true)
    draw_circle(quiet, 7.0, Color(0.18, 0.94, 0.42, 0.75), false, 2.0)
    draw_circle(hot, 5.0, Color(1.0, 0.22, 0.26), true)
    draw_circle(hot, 7.0, Color(1.0, 0.22, 0.26, 0.75), false, 2.0)
