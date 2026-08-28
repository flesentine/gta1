extends Node2D

const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")
const MISSION_PATH := "res://data/missions.json"

var game: Node
var campaign: Array = []
var campaign_index := 0
var current_mission: Dictionary = {}
var mission_state := "available"
var mission_target_vehicle: CharacterBody2D = null
var mission_cooldown := 0.0
var mission_timer := 0.0

var score := 0
var multiplier := 1
var level_target_score := 5000
var last_lives := 3

var phone_position := Vector2(260, 80)
var vehicle_spawn := Vector2.ZERO
var delivery_rect := Rect2()
var base_reward := 1000
var target_color := Color(0.10, 0.74, 0.82)
var mission_type := "steal_deliver"
var time_limit := 0.0
var starting_wanted := 0

var hud_panel: ColorRect
var hud_label: Label

func _ready() -> void:
    game = get_parent()
    _load_campaign()
    last_lives = int(game.lives)
    _build_hud()
    _refresh_hud()

func _load_campaign() -> void:
    if FileAccess.file_exists(MISSION_PATH):
        var file := FileAccess.open(MISSION_PATH, FileAccess.READ)
        if file != null:
            var parsed = JSON.parse_string(file.get_as_text())
            if parsed is Dictionary:
                var phone = parsed.get("phone", [260.0, 80.0])
                phone_position = Vector2(float(phone[0]), float(phone[1]))
                level_target_score = int(parsed.get("level_target_score", 5000))
                var loaded = parsed.get("campaign", [])
                if loaded is Array:
                    campaign = loaded
    if campaign.is_empty():
        campaign = [{
            "id": "hot_property",
            "title": "HOT PROPERTY",
            "type": "steal_deliver",
            "vehicle_spawn": [900.0, -360.0],
            "delivery_rect": [-1025.0, 565.0, 250.0, 170.0],
            "base_reward": 1000,
            "target_color": [0.10, 0.74, 0.82]
        }]
    _load_current_mission()

func _load_current_mission() -> void:
    if campaign.is_empty():
        return
    campaign_index = posmod(campaign_index, campaign.size())
    current_mission = campaign[campaign_index]
    mission_type = str(current_mission.get("type", "steal_deliver"))
    base_reward = int(current_mission.get("base_reward", 1000))
    time_limit = float(current_mission.get("time_limit", 0.0))
    starting_wanted = int(current_mission.get("starting_wanted", 0))

    var spawn = current_mission.get("vehicle_spawn", [0.0, 0.0])
    vehicle_spawn = Vector2(float(spawn[0]), float(spawn[1]))

    var delivery = current_mission.get("delivery_rect", [0.0, 0.0, 0.0, 0.0])
    delivery_rect = Rect2(float(delivery[0]), float(delivery[1]), float(delivery[2]), float(delivery[3]))

    var color = current_mission.get("target_color", [0.10, 0.74, 0.82])
    target_color = Color(float(color[0]), float(color[1]), float(color[2]))

func _build_hud() -> void:
    var layer := CanvasLayer.new()
    layer.layer = 20
    add_child(layer)

    hud_panel = ColorRect.new()
    hud_panel.anchor_left = 1.0
    hud_panel.anchor_right = 1.0
    hud_panel.offset_left = -430.0
    hud_panel.offset_right = -18.0
    hud_panel.offset_top = 18.0
    hud_panel.offset_bottom = 150.0
    hud_panel.color = Color(0.04, 0.04, 0.04, 0.86)
    hud_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    layer.add_child(hud_panel)

    hud_label = Label.new()
    hud_label.offset_left = 14.0
    hud_label.offset_top = 10.0
    hud_label.offset_right = 396.0
    hud_label.offset_bottom = 124.0
    hud_label.add_theme_font_size_override("font_size", 16)
    hud_panel.add_child(hud_label)

func _process(delta: float) -> void:
    if game == null:
        return

    var current_lives := int(game.lives)
    if current_lives < last_lives and _mission_is_active():
        _fail_mission("MISSION FAILED — LOST A LIFE")
    last_lives = current_lives

    if mission_cooldown > 0.0:
        mission_cooldown = max(mission_cooldown - delta, 0.0)
        if mission_cooldown <= 0.0:
            if mission_state == "campaign_complete":
                campaign_index = 0
                _load_current_mission()
            mission_state = "available"
            _set_game_message("MISSION PHONE READY", 1.2)

    if _mission_is_active() and time_limit > 0.0:
        mission_timer = max(mission_timer - delta, 0.0)
        if mission_timer <= 0.0:
            _fail_mission("MISSION FAILED — TIME EXPIRED")

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
    elif mission_state == "destroy":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — TARGET LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _complete_mission()
    elif mission_state == "escape":
        if int(game.wanted_level) <= 0:
            _complete_mission()

    _refresh_hud()

func _mission_is_active() -> bool:
    return mission_state in ["steal", "deliver", "destroy", "escape"]

func _start_mission() -> void:
    mission_timer = time_limit
    match mission_type:
        "steal_deliver":
            mission_state = "steal"
            _spawn_target_vehicle()
            _set_game_message("%s — STEAL THE MARKED CAR" % _title(), 2.4)
        "destroy_target":
            mission_state = "destroy"
            _spawn_target_vehicle()
            var ammo := int(current_mission.get("mission_ammo", 10))
            game.pistol_owned = true
            game.pistol_ammo = maxi(int(game.pistol_ammo), ammo)
            _set_game_message("%s — DESTROY THE MARKED CAR" % _title(), 2.4)
        "lose_wanted":
            mission_state = "escape"
            _set_wanted_at_least(starting_wanted)
            _set_game_message("%s — LOSE THE COPS" % _title(), 2.4)
        _:
            mission_state = "cooldown"
            mission_cooldown = 2.0
            _set_game_message("MISSION TYPE NOT SUPPORTED", 2.0)

func _set_wanted_at_least(level: int) -> void:
    var current := int(game.wanted_level)
    if current < level:
        game._raise_wanted(level - current)
    elif current > 0:
        game.wanted_decay_timer = max(float(game.wanted_decay_timer), 13.0 + float(current) * 2.0)

func _spawn_target_vehicle() -> void:
    var car = VEHICLE_SCRIPT.new()
    car.name = "MissionTarget_%s" % str(current_mission.get("id", campaign_index))
    var collision := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = Vector2(34, 64)
    collision.shape = shape
    car.add_child(collision)
    game.add_child(car)
    car.global_position = vehicle_spawn
    car.rotation = PI * 0.5
    car.set_body_color(target_color)
    car.set_parked()
    car.add_to_group("vehicles")
    game.vehicles.append(car)
    mission_target_vehicle = car

func _complete_mission() -> void:
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0

    campaign_index += 1
    if campaign_index >= campaign.size():
        mission_state = "campaign_complete"
        mission_cooldown = 5.0
        var target_note := ""
        if score >= level_target_score:
            target_note = " — LEVEL TARGET CLEARED"
        _set_game_message("CAMPAIGN COMPLETE  +%d%s" % [reward, target_note], 4.0)
    else:
        _load_current_mission()
        mission_state = "cooldown"
        mission_cooldown = 3.0
        _set_game_message("MISSION COMPLETE  +%d — NEXT: %s" % [reward, _title()], 3.0)

func _fail_mission(message: String) -> void:
    mission_state = "cooldown"
    mission_cooldown = 3.0
    mission_timer = 0.0
    mission_target_vehicle = null
    _set_game_message(message, 2.2)

func _set_game_message(message: String, duration: float) -> void:
    game.status_message = message
    game.status_message_timer = duration

func _title() -> String:
    return str(current_mission.get("title", "MISSION"))

func _objective_text() -> String:
    if mission_state == "available":
        return "TOUCH BLUE PHONE TO START"
    if mission_state == "steal":
        return "STEAL THE MARKED TEAL CAR"
    if mission_state == "deliver":
        if is_instance_valid(mission_target_vehicle) and delivery_rect.has_point(mission_target_vehicle.global_position):
            return "DELIVERY BAY — SLOW BELOW 75"
        return "DELIVER MARKED CAR TO YELLOW BAY"
    if mission_state == "destroy":
        return "DESTROY THE MARKED ORANGE CAR"
    if mission_state == "escape":
        return "CLEAR ALL WANTED HEADS"
    if mission_state == "campaign_complete":
        return "MINI CAMPAIGN COMPLETE — RESTARTING..."
    return "MISSION PHONE REOPENING..."

func _refresh_hud() -> void:
    if hud_label == null:
        return
    var mission_number := mini(campaign_index + 1, campaign.size())
    var timer_text := ""
    if _mission_is_active() and time_limit > 0.0:
        timer_text = "   TIME %02d" % int(ceil(mission_timer))
    var target_text := ""
    if level_target_score > 0:
        target_text = "   TARGET %05d" % level_target_score
    hud_label.text = "BUILD 8 — CAMPAIGN %d/%d — %s\n%s%s\nSCORE %07d%s   MULTIPLIER x%d" % [
        mission_number, campaign.size(), _title(), _objective_text(), timer_text,
        score, target_text, multiplier
    ]

func get_mission_state() -> String:
    return mission_state

func get_mission_phone_position() -> Vector2:
    return phone_position

func get_mission_delivery_rect() -> Rect2:
    return delivery_rect

func get_mission_target_vehicle() -> CharacterBody2D:
    return mission_target_vehicle

func get_mission_type() -> String:
    return mission_type

func get_escape_target_position() -> Vector2:
    if game == null:
        return Vector2.ZERO
    return game._player_target().global_position
