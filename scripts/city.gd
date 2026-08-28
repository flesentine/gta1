extends Node2D

const WORLD_RECT := Rect2(-1600.0, -1200.0, 3200.0, 2400.0)
const ROAD_HALF := 112.0
const ROAD_X := [-900.0, 0.0, 900.0]
const ROAD_Y := [-650.0, 0.0, 650.0]

var building_rects: Array[Rect2] = []

func _ready() -> void:
    _make_city_blocks()
    _build_collisions()
    queue_redraw()

func _make_city_blocks() -> void:
    var x_spans := [
        Vector2(-1540, -1040), Vector2(-760, -140),
        Vector2(140, 760), Vector2(1040, 1540)
    ]
    var y_spans := [
        Vector2(-1140, -790), Vector2(-510, -140),
        Vector2(140, 510), Vector2(790, 1140)
    ]
    for xs in x_spans:
        for ys in y_spans:
            var rect := Rect2(Vector2(xs.x, ys.x), Vector2(xs.y - xs.x, ys.y - ys.x))
            building_rects.append(rect)

func _draw() -> void:
    draw_rect(WORLD_RECT, Color(0.17, 0.25, 0.16), true)

    # Roads.
    for x in ROAD_X:
        draw_rect(Rect2(x - ROAD_HALF, WORLD_RECT.position.y, ROAD_HALF * 2.0, WORLD_RECT.size.y), Color(0.17, 0.18, 0.19), true)
        draw_dashed_line(Vector2(x, WORLD_RECT.position.y), Vector2(x, WORLD_RECT.end.y), Color(0.74, 0.68, 0.38), 3.0, 24.0)
    for y in ROAD_Y:
        draw_rect(Rect2(WORLD_RECT.position.x, y - ROAD_HALF, WORLD_RECT.size.x, ROAD_HALF * 2.0), Color(0.17, 0.18, 0.19), true)
        draw_dashed_line(Vector2(WORLD_RECT.position.x, y), Vector2(WORLD_RECT.end.x, y), Color(0.74, 0.68, 0.38), 3.0, 24.0)

    # Simple sidewalks and city blocks. Art is intentionally procedural/placeholding.
    for rect in building_rects:
        var sidewalk := rect.grow(22.0)
        draw_rect(sidewalk, Color(0.48, 0.48, 0.44), true)
        draw_rect(rect, Color(0.36, 0.32, 0.29), true)
        draw_rect(rect.grow(-12.0), Color(0.29, 0.27, 0.25), true)

func _build_collisions() -> void:
    for rect in building_rects:
        _add_static_rect(rect)

    var thickness := 80.0
    _add_static_rect(Rect2(WORLD_RECT.position.x - thickness, WORLD_RECT.position.y - thickness, WORLD_RECT.size.x + thickness * 2.0, thickness))
    _add_static_rect(Rect2(WORLD_RECT.position.x - thickness, WORLD_RECT.end.y, WORLD_RECT.size.x + thickness * 2.0, thickness))
    _add_static_rect(Rect2(WORLD_RECT.position.x - thickness, WORLD_RECT.position.y, thickness, WORLD_RECT.size.y))
    _add_static_rect(Rect2(WORLD_RECT.end.x, WORLD_RECT.position.y, thickness, WORLD_RECT.size.y))

func _add_static_rect(rect: Rect2) -> void:
    var body := StaticBody2D.new()
    var collision := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = rect.size
    collision.shape = shape
    body.position = rect.position + rect.size * 0.5
    body.add_child(collision)
    add_child(body)
