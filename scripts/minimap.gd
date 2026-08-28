extends Control

const CITY_PATH := "res://data/city_sector.json"
const RESPRAY_RECT := Rect2(-988, -365, 176, 130)
const MAP_RECT := Rect2(8, 28, 224, 128)

var game: Node
var director: Node
var world_rect := Rect2(-2400, -1700, 5200, 3400)
var road_half := 96.0
var road_x: Array = []
var road_y: Array = []
var buildings: Array[Rect2] = []
var parking_lots: Array[Rect2] = []
var nav_label: Label

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_IGNORE
    set_anchors_preset(Control.PRESET_TOP_RIGHT)
    offset_left = -258.0
    offset_top = 18.0
    offset_right = -18.0
    offset_bottom = 190.0
    game = get_tree().current_scene
    director = game.get_node_or_null("MissionDirector")
    _load_city()

    nav_label = Label.new()
    nav_label.position = Vector2(8, 154)
    nav_label.size = Vector2(224, 18)
    nav_label.add_theme_font_size_override("font_size", 11)
    add_child(nav_label)
    queue_redraw()

func _load_city() -> void:
    if not FileAccess.file_exists(CITY_PATH):
        return
    var file := FileAccess.open(CITY_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return

    var world = parsed.get("world", [-2400.0, -1700.0, 5200.0, 3400.0])
    world_rect = Rect2(float(world[0]), float(world[1]), float(world[2]), float(world[3]))
    road_half = float(parsed.get("road_half", 96.0))
    road_x = parsed.get("road_x", [])
    road_y = parsed.get("road_y", [])

    for item in parsed.get("buildings", []):
        buildings.append(Rect2(float(item[0]), float(item[1]), float(item[2]), float(item[3])))
    for item in parsed.get("parking_lots", []):
        parking_lots.append(Rect2(float(item[0]), float(item[1]), float(item[2]), float(item[3])))

func _process(_delta: float) -> void:
    if visible:
        _update_nav_label()
        queue_redraw()

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_M:
        visible = not visible
        get_viewport().set_input_as_handled()

func _update_nav_label() -> void:
    if nav_label == null or game == null:
        return
    var info := _navigation_info()
    if info.is_empty():
        nav_label.text = "M: MAP    NO ACTIVE OBJECTIVE"
        return
    var player_pos := _player_position()
    var target: Vector2 = info["position"]
    nav_label.text = "%s  %dm    M: MAP" % [str(info["label"]), int(round(player_pos.distance_to(target)))]

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, size), Color(0.025, 0.035, 0.045, 0.94), true)
    draw_rect(Rect2(Vector2.ZERO, size), Color(1, 1, 1, 0.28), false, 2.0)

    var sx := MAP_RECT.size.x / world_rect.size.x
    var sy := MAP_RECT.size.y / world_rect.size.y
    var scale := min(sx, sy)

    for x_value in road_x:
        var x := _map_point(Vector2(float(x_value), 0.0), scale).x
        draw_line(Vector2(x, MAP_RECT.position.y), Vector2(x, MAP_RECT.end.y), Color(0.18, 0.22, 0.25), max(2.0, road_half * 2.0 * scale))
    for y_value in road_y:
        var y := _map_point(Vector2(0.0, float(y_value)), scale).y
        draw_line(Vector2(MAP_RECT.position.x, y), Vector2(MAP_RECT.end.x, y), Color(0.18, 0.22, 0.25), max(2.0, road_half * 2.0 * scale))

    for rect in buildings:
        draw_rect(_map_rect(rect, scale), Color(0.35, 0.39, 0.42), true)
    for rect in parking_lots:
        draw_rect(_map_rect(rect, scale), Color(0.16, 0.28, 0.33), true)

    if game != null:
        for cop in game.police:
            if is_instance_valid(cop):
                draw_circle(_map_point(cop.global_position, scale), 2.4, Color(0.95, 0.25, 0.25))

        var info := _navigation_info()
        if not info.is_empty():
            draw_circle(_map_point(info["position"], scale), 5.0, Color(1.0, 0.83, 0.20), false, 2.0)

        draw_circle(_map_point(_player_position(), scale), 3.8, Color(0.35, 0.90, 1.0))

func _map_point(world_pos: Vector2, scale: float) -> Vector2:
    var used_size := world_rect.size * scale
    var origin := MAP_RECT.position + (MAP_RECT.size - used_size) * 0.5
    return origin + (world_pos - world_rect.position) * scale

func _map_rect(rect: Rect2, scale: float) -> Rect2:
    return Rect2(_map_point(rect.position, scale), rect.size * scale)

func _player_position() -> Vector2:
    if game.in_vehicle and is_instance_valid(game.current_vehicle):
        return game.current_vehicle.global_position
    return game.player.global_position

func _navigation_info() -> Dictionary:
    if director == null:
        return {}
    var state := str(director.mission_state)
    if state in ["available", "menu", "menu_wait"]:
        return {"label": "MISSION PHONE", "position": director.phone_position}
    if state in ["steal", "destroy"] and is_instance_valid(director.mission_target_vehicle):
        return {"label": "TARGET CAR", "position": director.mission_target_vehicle.global_position}
    if state == "deliver":
        return {"label": "DELIVERY", "position": director.delivery_rect.get_center()}
    if state == "escape":
        return {"label": "RES-PRAY", "position": RESPRAY_RECT.get_center()}
    return {}
