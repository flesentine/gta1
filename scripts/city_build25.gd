extends "res://scripts/city_build22.gd"

const WEST_PATH_BUILD25 := "res://data/west_ridge.json"

func _ready() -> void:
    _load_sector()
    _load_harbor()
    _load_west25()
    _build_collisions()
    queue_redraw()

func _load_west25() -> void:
    if not FileAccess.file_exists(WEST_PATH_BUILD25):
        return
    var file := FileAccess.open(WEST_PATH_BUILD25, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    var world = parsed.get("world", [-5400.0, -1700.0, 3000.0, 3400.0])
    if world is Array and world.size() >= 4:
        world_rect = world_rect.merge(Rect2(float(world[0]), float(world[1]), float(world[2]), float(world[3])))
    for value in parsed.get("road_x", []):
        var x := float(value)
        if not road_x.has(x):
            road_x.append(x)
    road_x.sort()
    building_rects.append_array(_rect_array(parsed.get("buildings", [])))
    parking_lots.append_array(_rect_array(parsed.get("parking_lots", [])))
    alleys.append_array(_rect_array(parsed.get("alleys", [])))
    var loaded_districts = parsed.get("districts", [])
    if loaded_districts is Array:
        for district in loaded_districts:
            if district is Dictionary:
                districts.append(district)
    sector_data["west_ridge"] = parsed

func _draw() -> void:
    super._draw()
    if not sector_data.has("west_ridge"):
        return
    var west: Dictionary = sector_data["west_ridge"]
    var landmarks = west.get("landmarks", {})
    if not landmarks is Dictionary:
        return
    var runway = landmarks.get("runway_rect", [])
    if runway is Array and runway.size() >= 4:
        var rect := Rect2(float(runway[0]), float(runway[1]), float(runway[2]), float(runway[3]))
        draw_rect(rect, Color(0.42, 0.46, 0.49, 0.16), true)
        draw_dashed_line(Vector2(rect.position.x + 40.0, rect.get_center().y), Vector2(rect.end.x - 40.0, rect.get_center().y), Color(0.96, 0.96, 0.90, 0.72), 4.0, 34.0)
