extends "res://scripts/city_build21.gd"

func _draw() -> void:
    super._draw()
    var arc_color := Color(0.35, 0.80, 0.94, 0.18)
    for x in road_x:
        for y in road_y:
            var p := Vector2(x, y)
            draw_arc(p + Vector2(-34, -34), 28.0, 0.0, PI * 0.5, 12, arc_color, 2.0)
            draw_arc(p + Vector2(34, -34), 28.0, PI * 0.5, PI, 12, arc_color, 2.0)
            draw_arc(p + Vector2(34, 34), 28.0, PI, PI * 1.5, 12, arc_color, 2.0)
            draw_arc(p + Vector2(-34, 34), 28.0, PI * 1.5, TAU, 12, arc_color, 2.0)
    var manager = get_parent().get_node_or_null("WorldManager")
    if manager != null and manager.has_method("get_reserved_intersections"):
        for point in manager.get_reserved_intersections():
            draw_arc(point, 42.0, 0.0, TAU, 32, Color(0.20, 0.90, 0.95, 0.72), 3.0)
