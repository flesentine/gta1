extends "res://scripts/world_manager_build16.gd"

const HARBOR_PATH_BUILD18 := "res://data/harbor_east.json"

func _ready() -> void:
    super._ready()
    _append_harbor_routes()
    traffic_floor = 22

func _append_harbor_routes() -> void:
    if not FileAccess.file_exists(HARBOR_PATH_BUILD18):
        return
    var file := FileAccess.open(HARBOR_PATH_BUILD18, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    var harbor_routes := _route_array(parsed.get("traffic_routes", []))
    for route in harbor_routes:
        traffic_routes.append(route)
