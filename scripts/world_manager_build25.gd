extends "res://scripts/world_manager_build24.gd"

const HARBOR_PATH_BUILD25 := "res://data/harbor_east.json"
const WEST_PATH_BUILD25 := "res://data/west_ridge.json"

func _load_routes() -> void:
    super._load_routes()
    _append_sector_routes25(HARBOR_PATH_BUILD25)
    _append_sector_routes25(WEST_PATH_BUILD25)

func _append_sector_routes25(path: String) -> void:
    if not FileAccess.file_exists(path):
        return
    var file := FileAccess.open(path, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    for route in _route_array(parsed.get("traffic_routes", [])):
        traffic_routes.append(route)
