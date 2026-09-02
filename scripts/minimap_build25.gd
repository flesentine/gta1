extends "res://scripts/minimap_build24.gd"

func _draw() -> void:
    super._draw()
    if director == null or str(director.current_mission.get("id", "")) != "airmail":
        return
    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)
    if str(director.mission_state) == "airmail_drive":
        var p := _map_point(director.get_airmail_current_point25(), scale)
        draw_circle(p, 5.0, Color(0.96, 0.94, 0.76), true)
        draw_circle(p, 8.0, Color(0.96, 0.94, 0.76, 0.72), false, 2.0)
    elif str(director.mission_state) == "airmail_deliver":
        var p := _map_point(director.get_airmail_final25().get_center(), scale)
        draw_circle(p, 6.0, Color(0.48, 0.90, 0.42), true)
        draw_circle(p, 9.0, Color(0.48, 0.90, 0.42, 0.72), false, 2.0)
