extends "res://scripts/city_build18.gd"

const SIGNAL_CYCLE := 12.0

func _process(_delta: float) -> void:
    queue_redraw()

func _draw() -> void:
    super._draw()
    var now := Time.get_ticks_msec() / 1000.0
    for x in road_x:
        for y in road_y:
            var point := Vector2(x, y)
            var phase := fmod(now + abs(point.x * 0.003 + point.y * 0.005), SIGNAL_CYCLE)
            var horizontal_green := phase < 5.0
            var vertical_green := phase >= 6.0 and phase < 11.0
            var h_color := Color(0.18, 0.92, 0.38, 0.92) if horizontal_green else Color(0.95, 0.18, 0.16, 0.92)
            var v_color := Color(0.18, 0.92, 0.38, 0.92) if vertical_green else Color(0.95, 0.18, 0.16, 0.92)
            draw_circle(point + Vector2(-22, -22), 4.0, h_color)
            draw_circle(point + Vector2(22, 22), 4.0, h_color)
            draw_circle(point + Vector2(22, -22), 4.0, v_color)
            draw_circle(point + Vector2(-22, 22), 4.0, v_color)
