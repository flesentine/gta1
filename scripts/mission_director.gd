extends Node2D

const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")
const MISSION_PATH := "res://data/missions.json"

var game: Node
var config: Dictionary = {}
var mission_state := "available"
var mission_target_vehicle: CharacterBody2D = null
var mission_cooldown := 0.0
var score := 0
var multiplier := 1
var last_lives := 3
var phone_position := Vector2(260, 80)
var vehicle_spawn := Vector2(900, -360)
var delivery_rect := Rect2(-1025, 565, 250, 170)
var base_reward := 1000
var target_color := Color(0.10, 0.74, 0.82)

var hud_panel: ColorRect
var hud_label: Label

func _ready() -> void:
    game = get_parent()
    _load_config()
    last_lives = int(game.lives)
    _build_hud()
    _refresh_hud()

func _load_config() -> void:
    if not FileAccess.file_exists(MISSION_PATH):
        return
    var file := FileAccess.open(MISSION_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not (parsed is Dictionary) or not parsed.has("hot_property"):
        return
    config = parsed["hot_property"]
    var phone = config.get("phone", [260.0, 80.0])
    var spawn = config.get("vehicle_spawn", [900.0, -360.0])
    var delivery = config.get("delivery_rect", [-1025.0, 565.0, 250.0, 170.0])
    var color = config.get("target_color", [0.10, 0.74, 0.82])
    phone_position = Vector2(float(phone[0]), float(phone[1]))
    vehicle_spawn = Vector2(float(spawn[0]), float(spawn[1]))
    delivery_rect = Rect2(float(delivery[0]), float(delivery[1]), float(delivery[2]), float(delivery[3]))
    base_reward = int(config.get("base_reward", 1000))
    target_color = Color(float(color[0]), float(color[1]), float(color[2]))

func _build_hud() -> void:
    var layer := CanvasLayer.new()
    layer.layer = 20
    add_child(layer)

    hud_panel = ColorRect.new()
    hud_panel.anchor_left = 1.0
    hud_panel.anchor_right = 1.0
    hud_panel.offset_left = -390.0
    hud_panel.offset_right = -18.0
    hud_panel.offset_top = 18.0
    hud_panel.offset_bottom = 128.0
    hud_panel.color = Color(0.04, 0.04, 0.04, 0.84)
    hud_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    layer.add_child(hud_panel)

    hud_label = Label.new()
    hud_label.offset_left = 14.0
    hud_label.offset_top = 10.0
    hud_label.offset_right = 356.0
    hud_label.offset_bottom = 100.0
    hud_label.add_theme_font_size_override("font_size", 16)
    hud_panel.add_child(hud_label)

func _process(delta: float) -> void:
    if game == null:
        return

    var current_lives := int(game.lives)
    if current_lives < last_lives and mission_state in ["steal", "deliver"]:
        mission_state = "cooldown"
        mission_cooldown = 3.0
        mission_target_vehicle = null
    last_lives = current_lives

    if mission_cooldown > 0.0:
        mission_cooldown = max(mission_cooldown - delta, 0.0)
        if mission_cooldown <= 0.0:
            mission_state = "available"

    if float(game.respawn_timer) > 0.0:
        _refresh_hud()
        return

    if mission_state == "available":
        if not bool(game.in_vehicle) and game.player.global_position.distance_to(phone_position) <= 34.0:
            _start_mission()
    elif mission_state == "steal":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — TARGET LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _fail_mission("MISSION FAILED — CAR DESTROYED")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "deliver"
            _set_game_message("TARGET ACQUIRED — DELIVER THE CAR", 2.0)
    elif mission_state == "deliver":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — TARGET LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _fail_mission("MISSION FAILED — CAR DESTROYED")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if delivery_rect.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= 75.0:
                _complete_mission()

    _refresh_hud()

func _start_mission() -> void:
    mission_state = "steal"
    _spawn_target_vehicle()
    _set_game_message("HOT PROPERTY — STEAL THE MARKED CAR", 2.4)

func _spawn_target_vehicle() -> void:
    var car = VEHICLE_SCRIPT.new()
    car.name = "MissionTargetCar"
    var collision := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = Vector2(34, 64)
    collision.shape = shape
    car.add_child(collision)
    game.add_child(car)
    car.global_position = vehicle_spawn
    car.rotation = 0.0
    car.set_body_color(target_color)
    car.set_parked()
    car.add_to_group("vehicles")
    game.vehicles.append(car)
    mission_target_vehicle = car

func _complete_mission() -> void:
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_state = "cooldown"
    mission_cooldown = 4.0
    mission_target_vehicle = null
    _set_game_message("MISSION COMPLETE  +%d" % reward, 3.0)

func _fail_mission(message: String) -> void:
    mission_state = "cooldown"
    mission_cooldown = 3.0
    mission_target_vehicle = null
    _set_game_message(message, 2.2)

func _set_game_message(message: String, duration: float) -> void:
    game.status_message = message
    game.status_message_timer = duration

func _refresh_hud() -> void:
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 6", "BUILD 7")
    if hud_label == null:
        return
    var title := str(config.get("title", "HOT PROPERTY"))
    var objective := "TOUCH BLUE PHONE TO START"
    if mission_state == "steal":
        objective = "STEAL THE MARKED TEAL CAR"
    elif mission_state == "deliver":
        objective = "DELIVER MARKED CAR TO YELLOW BAY"
        if is_instance_valid(mission_target_vehicle) and delivery_rect.has_point(mission_target_vehicle.global_position):
            objective = "DELIVERY BAY — SLOW BELOW 75"
    elif mission_state == "cooldown":
        objective = "MISSION PHONE REOPENING..."
    hud_label.text = "MISSION — %s\n%s\nSCORE %07d   MULTIPLIER x%d" % [title, objective, score, multiplier]

func get_mission_state() -> String:
    return mission_state

func get_mission_phone_position() -> Vector2:
    return phone_position

func get_mission_delivery_rect() -> Rect2:
    return delivery_rect

func get_mission_target_vehicle() -> CharacterBody2D:
    return mission_target_vehicle
