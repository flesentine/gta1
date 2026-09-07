extends "res://scripts/city_build25.gd"

func _draw() -> void:
    super._draw()
    var manager = get_parent().get_node_or_null("WorldManager")
    if manager == null or not manager.has_method("get_spike_strip_rects26"):
        return
    for rect in manager.get_spike_strip_rects26():
        draw_rect(rect, Color(0.06, 0.07, 0.08, 0.95), true)
        draw_rect(rect, Color(0.95, 0.78, 0.34, 0.85), false, 2.0)
        var horizontal_motion := rect.size.y > rect.size.x
        for i in range(8):
            var t := float(i) / 7.0
            var p := Vector2.ZERO
            if horizontal_motion:
                p = Vector2(rect.get_center().x, lerp(rect.position.y + 10.0, rect.end.y - 10.0, t))
                draw_line(p + Vector2(-7.0, 5.0), p + Vector2(0.0, -6.0), Color(0.93, 0.94, 0.90), 2.0)
                draw_line(p + Vector2(0.0, -6.0), p + Vector2(7.0, 5.0), Color(0.93, 0.94, 0.90), 2.0)
            else:
                p = Vector2(lerp(rect.position.x + 10.0, rect.end.x - 10.0, t), rect.get_center().y)
                draw_line(p + Vector2(-5.0, 7.0), p + Vector2(6.0, 0.0), Color(0.93, 0.94, 0.90), 2.0)
                draw_line(p + Vector2(6.0, 0.0), p + Vector2(-5.0, -7.0), Color(0.93, 0.94, 0.90), 2.0)
