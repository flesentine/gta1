extends "res://scripts/minimap_build22.gd"

func _draw() -> void:
    super._draw()
    if director == null or str(director.current_mission.get("id", "")) != "twin_strike": return
    var state := str(director.mission_state)
    var sx := MAP_RECT.size.x / world_rect.size.x; var sy := MAP_RECT.size.y / world_rect.size.y; var scale := min(sx, sy)
    if state == "parallel_targets":
        var points = director.get_parallel_objectives24(); var done = director.get_parallel_done24()
        for i in range(points.size()):
            if i < done.size() and done[i]: continue
            var p := _map_point(points[i], scale); var color := Color(1.0, 0.82, 0.28) if i == 0 else Color(0.28, 0.90, 1.0)
            draw_circle(p, 5.0, color, true); draw_circle(p, 7.0, Color(color.r, color.g, color.b, 0.75), false, 2.0)
    elif state == "parallel_deliver":
        var p := _map_point(director.get_parallel_final_delivery24().get_center(), scale)
        draw_circle(p, 6.0, Color(0.24, 0.90, 0.48), true); draw_circle(p, 9.0, Color(0.24, 0.90, 0.48, 0.75), false, 2.0)
