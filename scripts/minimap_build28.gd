extends "res://scripts/minimap_build27.gd"

func _draw() -> void:
    super._draw()
    if director == null or str(director.current_mission.get("id", "")) != "three_fronts":
        return
    var state := str(director.mission_state)
    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)
    if state == "front_armory":
        var p := _map_point(director.get_front_armory28(), scale)
        draw_circle(p, 6.0, Color(0.38, 0.91, 1.0), true)
        draw_circle(p, 9.0, Color(0.38, 0.91, 1.0, 0.75), false, 2.0)
    elif state == "front_target":
        var p := _map_point(director.get_front_target_position28(), scale)
        var colors := [Color(1.0, 0.33, 0.27), Color(1.0, 0.76, 0.29), Color(0.78, 0.46, 1.0)]
        var color: Color = colors[clampi(director.get_front_index28(), 0, 2)]
        draw_circle(p, 5.0, color, true)
        draw_circle(p, 8.0, Color(color.r, color.g, color.b, 0.75), false, 2.0)
