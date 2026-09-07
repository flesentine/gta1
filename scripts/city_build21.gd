extends "res://scripts/city_build19.gd"

func _draw() -> void:
    super._draw()
    var pocket := Color(0.94, 0.86, 0.42, 0.30)
    for x in road_x:
        for y in road_y:
            var p := Vector2(x, y)
            draw_line(p + Vector2(-78, -34), p + Vector2(-30, -34), pocket, 2.0)
            draw_line(p + Vector2(-30, -34), p + Vector2(-20, -44), pocket, 2.0)
            draw_line(p + Vector2(34, -78), p + Vector2(34, -30), pocket, 2.0)
            draw_line(p + Vector2(34, -30), p + Vector2(44, -20), pocket, 2.0)
