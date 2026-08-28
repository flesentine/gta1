extends Node2D

var pickup_kind := "ammo"
var amount := 10
var phase := 0.0

func configure(kind: String, position_value: Vector2, amount_value: int) -> void:
    pickup_kind = kind
    amount = amount_value
    global_position = position_value
    queue_redraw()

func _process(delta: float) -> void:
    phase += delta * 3.0
    queue_redraw()

func _draw() -> void:
    var bob := sin(phase) * 3.0
    var center := Vector2(0.0, bob)

    if pickup_kind == "bribe":
        var diamond := PackedVector2Array([
            center + Vector2(0, -15), center + Vector2(15, 0),
            center + Vector2(0, 15), center + Vector2(-15, 0)
        ])
        draw_colored_polygon(diamond, Color(0.08, 0.16, 0.10, 0.92))
        var inner := PackedVector2Array([
            center + Vector2(0, -11), center + Vector2(11, 0),
            center + Vector2(0, 11), center + Vector2(-11, 0)
        ])
        draw_colored_polygon(inner, Color(0.20, 0.82, 0.36))
        draw_rect(Rect2(center + Vector2(-5, -7), Vector2(10, 14)), Color(0.96, 0.98, 0.92), true)
        return

    draw_rect(Rect2(center - Vector2(13, 13), Vector2(26, 26)), Color(0.10, 0.10, 0.10, 0.88), true)
    draw_rect(Rect2(center - Vector2(10, 10), Vector2(20, 20)), Color(0.94, 0.74, 0.16), true)

    if pickup_kind == "pistol":
        draw_rect(Rect2(center + Vector2(-7, -3), Vector2(12, 5)), Color(0.10, 0.10, 0.10), true)
        draw_rect(Rect2(center + Vector2(2, 1), Vector2(5, 8)), Color(0.10, 0.10, 0.10), true)
    else:
        draw_rect(Rect2(center + Vector2(-6, -6), Vector2(4, 12)), Color(0.10, 0.10, 0.10), true)
        draw_rect(Rect2(center + Vector2(2, -6), Vector2(4, 12)), Color(0.10, 0.10, 0.10), true)
