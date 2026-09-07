extends Node2D

const SECTOR_PATH := "res://data/city_sector.json"

var world_rect := Rect2(-2400.0, -1700.0, 5200.0, 3400.0)
var road_half := 96.0
var road_x: Array[float] = []
var road_y: Array[float] = []
var building_rects: Array[Rect2] = []
var parking_lots: Array[Rect2] = []
var alleys: Array[Rect2] = []
var districts: Array[Dictionary] = []
var sector_data: Dictionary = {}

func _ready() -> void:
    _load_sector()
    _build_collisions()
    queue_redraw()

func _load_sector() -> void:
    if not FileAccess.file_exists(SECTOR_PATH):
        return
    var file := FileAccess.open(SECTOR_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return

    sector_data = parsed

    var world = parsed.get("world", [-2400.0, -1700.0, 5200.0, 3400.0])
    if world is Array and world.size() >= 4:
        world_rect = Rect2(float(world[0]), float(world[1]), float(world[2]), float(world[3]))

    road_half = float(parsed.get("road_half", 96.0))

    road_x.clear()
    for value in parsed.get("road_x", []):
        road_x.append(float(value))

    road_y.clear()
    for value in parsed.get("road_y", []):
        road_y.append(float(value))

    building_rects = _rect_array(parsed.get("buildings", []))
    parking_lots = _rect_array(parsed.get("parking_lots", []))
    alleys = _rect_array(parsed.get("alleys", []))

    districts.clear()
    var loaded_districts = parsed.get("districts", [])
    if loaded_districts is Array:
        for district in loaded_districts:
            if district is Dictionary:
                districts.append(district)

func _rect_array(items: Variant) -> Array[Rect2]:
    var result: Array[Rect2] = []
    if not items is Array:
        return result
    for item in items:
        if item is Array and item.size() >= 4:
            result.append(Rect2(float(item[0]), float(item[1]), float(item[2]), float(item[3])))
    return result

func _draw() -> void:
    draw_rect(world_rect, Color(0.15, 0.23, 0.14), true)

    for x in road_x:
        draw_rect(Rect2(x - road_half, world_rect.position.y, road_half * 2.0, world_rect.size.y), Color(0.155, 0.165, 0.18), true)
        draw_dashed_line(Vector2(x, world_rect.position.y), Vector2(x, world_rect.end.y), Color(0.73, 0.66, 0.35), 3.0, 26.0)
    for y in road_y:
        draw_rect(Rect2(world_rect.position.x, y - road_half, world_rect.size.x, road_half * 2.0), Color(0.155, 0.165, 0.18), true)
        draw_dashed_line(Vector2(world_rect.position.x, y), Vector2(world_rect.end.x, y), Color(0.73, 0.66, 0.35), 3.0, 26.0)

    for alley in alleys:
        draw_rect(alley, Color(0.12, 0.13, 0.14), true)
        if alley.size.y >= alley.size.x:
            draw_line(Vector2(alley.get_center().x, alley.position.y + 4), Vector2(alley.get_center().x, alley.end.y - 4), Color(0.30, 0.30, 0.30), 2.0)
        else:
            draw_line(Vector2(alley.position.x + 4, alley.get_center().y), Vector2(alley.end.x - 4, alley.get_center().y), Color(0.30, 0.30, 0.30), 2.0)

    for lot in parking_lots:
        draw_rect(lot, Color(0.20, 0.215, 0.225), true)
        draw_rect(lot, Color(0.40, 0.42, 0.43), false, 3.0)
        var x := lot.position.x + 22.0
        while x < lot.end.x - 18.0:
            draw_line(Vector2(x, lot.position.y + 12.0), Vector2(x, lot.position.y + 42.0), Color(0.65, 0.65, 0.58, 0.55), 2.0)
            x += 42.0

    for rect in building_rects:
        var sidewalk := rect.grow(18.0)
        draw_rect(sidewalk, Color(0.46, 0.46, 0.43), true)
        draw_rect(rect, Color(0.35, 0.31, 0.29), true)
        if rect.size.x > 80.0 and rect.size.y > 80.0:
            draw_rect(rect.grow(-10.0), Color(0.285, 0.265, 0.25), true)

    for district in districts:
        var label = district.get("label", [0.0, 0.0])
        if label is Array and label.size() >= 2:
            var pos := Vector2(float(label[0]), float(label[1]))
            draw_string(ThemeDB.fallback_font, pos, str(district.get("name", "DISTRICT")), HORIZONTAL_ALIGNMENT_LEFT, -1, 28, Color(1, 1, 1, 0.20))

func _build_collisions() -> void:
    for rect in building_rects:
        _add_static_rect(rect)

    var thickness := 100.0
    _add_static_rect(Rect2(world_rect.position.x - thickness, world_rect.position.y - thickness, world_rect.size.x + thickness * 2.0, thickness))
    _add_static_rect(Rect2(world_rect.position.x - thickness, world_rect.end.y, world_rect.size.x + thickness * 2.0, thickness))
    _add_static_rect(Rect2(world_rect.position.x - thickness, world_rect.position.y, thickness, world_rect.size.y))
    _add_static_rect(Rect2(world_rect.end.x, world_rect.position.y, thickness, world_rect.size.y))

func _add_static_rect(rect: Rect2) -> void:
    var body := StaticBody2D.new()
    var collision := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = rect.size
    collision.shape = shape
    body.position = rect.position + rect.size * 0.5
    body.add_child(collision)
    add_child(body)

func get_sector_data() -> Dictionary:
    return sector_data

func get_world_rect() -> Rect2:
    return world_rect
