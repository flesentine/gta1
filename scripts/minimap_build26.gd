extends "res://scripts/minimap_build25.gd"

func _draw() -> void:
    super._draw()
    if director == null or str(director.current_mission.get("id", "")) != "lockdown":
        return
    var state := str(director.mission_state)
    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)
    if state == "lockdown_run":
        var p := _map_point(director.get_lockdown_current_point26(), scale)
        draw_circle(p, 5.0, Color(1.0, 0.48, 0.20), true)
        draw_circle(p, 8.0, Color(1.0, 0.48, 0.20, 0.75), false, 2.0)
    elif state == "lockdown_deliver":
        var p := _map_point(director.get_lockdown_final26().get_center(), scale)
        draw_circle(p, 6.0, Color(0.46, 0.90, 0.40), true)
        draw_circle(p, 9.0, Color(0.46, 0.90, 0.40, 0.75), false, 2.0)
