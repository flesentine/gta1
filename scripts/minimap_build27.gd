extends "res://scripts/minimap_build26.gd"

func _draw() -> void:
    super._draw()
    if director == null or str(director.current_mission.get("id", "")) != "runway_raid":
        return
    var state := str(director.mission_state)
    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)
    if state == "raid_armory":
        var p := _map_point(director.get_raid_armory27(), scale)
        draw_circle(p, 6.0, Color(1.0, 0.83, 0.28), true)
        draw_circle(p, 9.0, Color(1.0, 0.83, 0.28, 0.75), false, 2.0)
    elif state == "raid_targets":
        var points = director.get_raid_target_positions27()
        var alive = director.get_raid_target_alive27()
        for i in range(points.size()):
            if i >= alive.size() or not alive[i]:
                continue
            var p := _map_point(points[i], scale)
            draw_circle(p, 5.0, Color(1.0, 0.24, 0.31), true)
            draw_circle(p, 8.0, Color(1.0, 0.24, 0.31, 0.75), false, 2.0)
