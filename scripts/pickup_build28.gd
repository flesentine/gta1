extends "res://scripts/pickup_build27.gd"

func _draw() -> void:
    if pickup_kind != "smg" and pickup_kind != "smg_ammo":
        super._draw()
        return
    var bob := sin(phase) * 3.0
    var center := Vector2(0.0, bob)
    draw_rect(Rect2(center - Vector2(14, 11), Vector2(28, 22)), Color(0.07, 0.08, 0.09, 0.92), true)
    if pickup_kind == "smg":
        draw_rect(Rect2(center + Vector2(-11, -3), Vector2(20, 6)), Color(0.42, 0.46, 0.50), true)
        draw_rect(Rect2(center + Vector2(-14, -2), Vector2(7, 4)), Color(0.13, 0.15, 0.17), true)
        draw_rect(Rect2(center + Vector2(4, 3), Vector2(5, 8)), Color(0.13, 0.15, 0.17), true)
        draw_rect(Rect2(center + Vector2(0, 2), Vector2(5, 8)), Color(0.56, 0.42, 0.22), true)
    else:
        draw_rect(Rect2(center + Vector2(-8, -7), Vector2(16, 14)), Color(0.48, 0.54, 0.58), true)
        for i in range(3):
            draw_rect(Rect2(center + Vector2(float(-6 + i * 5), -4), Vector2(3, 8)), Color(0.84, 0.69, 0.30), true)
