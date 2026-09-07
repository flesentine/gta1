extends "res://scripts/minimap_build28.gd"

func _draw() -> void:
    super._draw()
    if director == null or str(director.current_mission.get("id", "")) != "crossfire":
        return
    var state := str(director.mission_state)
    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)
    if state == "crossfire_staging":
        var p := _map_point(director.get_crossfire_staging29(), scale)
        draw_circle(p, 6.0, Color(1.0, 0.68, 0.25), true)
        draw_circle(p, 9.0, Color(1.0, 0.68, 0.25, 0.75), false, 2.0)
    elif state == "crossfire_hostiles":
        var points = director.get_crossfire_positions29()
        var alive = director.get_crossfire_alive29()
        for i in range(points.size()):
            if i >= alive.size() or not alive[i]:
                continue
            var p := _map_point(points[i], scale)
            draw_circle(p, 4.5, Color(1.0, 0.26, 0.32), true)
            draw_circle(p, 7.0, Color(1.0, 0.26, 0.32, 0.72), false, 1.5)
