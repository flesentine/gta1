extends Node2D

func _ready() -> void:
    z_index = 2
    queue_redraw()

func _draw() -> void:
    var rect := Rect2(-88, -65, 176, 130)
    draw_rect(rect, Color(0.52, 0.12, 0.48, 0.30), true)
    draw_rect(rect, Color(0.94, 0.35, 0.82, 0.92), false, 5.0)
    draw_line(Vector2(-62, -26), Vector2(62, -26), Color(1.0, 0.78, 0.96, 0.75), 4.0)
    draw_line(Vector2(-62, 26), Vector2(62, 26), Color(1.0, 0.78, 0.96, 0.75), 4.0)
