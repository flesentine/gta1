extends "res://scripts/city.gd"

const HARBOR_PATH := "res://data/harbor_east.json"

func _ready() -> void:
    _load_sector()
    _load_harbor()
    _build_collisions()
    queue_redraw()

func _load_harbor() -> void:
    if not FileAccess.file_exists(HARBOR_PATH):
        return
    var file := FileAccess.open(HARBOR_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return

    var world = parsed.get("world", [2800.0, -1700.0, 2600.0, 3400.0])
    if world is Array and world.size() >= 4:
        var harbor_rect := Rect2(float(world[0]), float(world[1]), float(world[2]), float(world[3]))
        world_rect = world_rect.merge(harbor_rect)

    for value in parsed.get("road_x", []):
        var x := float(value)
        if not road_x.has(x):
            road_x.append(x)

    building_rects.append_array(_rect_array(parsed.get("buildings", [])))
    parking_lots.append_array(_rect_array(parsed.get("parking_lots", [])))
    alleys.append_array(_rect_array(parsed.get("alleys", [])))

    var loaded_districts = parsed.get("districts", [])
    if loaded_districts is Array:
        for district in loaded_districts:
            if district is Dictionary:
                districts.append(district)

    sector_data["harbor_east"] = parsed
