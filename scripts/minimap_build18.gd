extends "res://scripts/minimap_build17.gd"

const HARBOR_PATH_BUILD18 := "res://data/harbor_east.json"

func _ready() -> void:
    super._ready()
    _load_harbor_map()

func _load_harbor_map() -> void:
    if not FileAccess.file_exists(HARBOR_PATH_BUILD18):
        return
    var file := FileAccess.open(HARBOR_PATH_BUILD18, FileAccess.READ)
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
    for item in parsed.get("buildings", []):
        if item is Array and item.size() >= 4:
            buildings.append(Rect2(float(item[0]), float(item[1]), float(item[2]), float(item[3])))
    for item in parsed.get("parking_lots", []):
        if item is Array and item.size() >= 4:
            parking_lots.append(Rect2(float(item[0]), float(item[1]), float(item[2]), float(item[3])))
