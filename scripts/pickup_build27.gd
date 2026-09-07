extends "res://scripts/pickup.gd"

func _draw() -> void:
    if pickup_kind != "shotgun" and pickup_kind != "shells":
        super._draw()
        return
    var bob := sin(phase) * 3.0
    var center := Vector2(0.0, bob)
    draw_rect(Rect2(center - Vector2(14, 11), Vector2(28, 22)), Color(0.07, 0.08, 0.09, 0.92), true)
    if pickup_kind == "shotgun":
        draw_rect(Rect2(center + Vector2(-10, -3), Vector2(19, 5)), Color(0.84, 0.81, 0.70), true)
        draw_rect(Rect2(center + Vector2(5, 2), Vector2(5, 9)), Color(0.43, 0.27, 0.14), true)
        draw_rect(Rect2(center + Vector2(-13, -2), Vector2(6, 4)), Color(0.20, 0.23, 0.26), true)
    else:
        for i in range(-1, 2):
            draw_rect(Rect2(center + Vector2(float(i * 7 - 2), -6), Vector2(4, 12)), Color(0.78, 0.17, 0.12), true)
            draw_rect(Rect2(center + Vector2(float(i * 7 - 2), -6), Vector2(4, 3)), Color(0.84, 0.70, 0.32), true)
