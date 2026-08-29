extends Node2D

const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")
const MISSION_PATH := "res://data/missions.json"
const SAVE_PATH := "user://gta1_build9_progress.json"

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
var best_score := 0
var level_complete := false
var sector_unlocked := false
var last_lives := 3
var completion_overlay_timer := 0.0

var phone_position := Vector2(260, 80)
var vehicle_spawn := Vector2.ZERO
var delivery_rect := Rect2()
var base_reward := 1000
var target_color := Color(0.10, 0.74, 0.82)
var mission_type := "steal_deliver"
var time_limit := 0.0
var starting_wanted := 0

var chain_points: Array[Vector2] = []
var chain_index := 0
var chain_radius := 90.0
var chain_speed := 110.0
var chain_heat := 1

var hud_panel: ColorRect
var hud_label: Label
var completion_panel: ColorRect
var completion_label: Label

func _ready() -> void:
    game = get_parent()
    _load_campaign()
    _load_progress()
    _load_current_mission()
    last_lives = int(game.lives)
    _build_hud()
    _build_completion_overlay()
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

func _load_progress() -> void:
    if not FileAccess.file_exists(SAVE_PATH):
        return
    var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    score = maxi(int(parsed.get("score", 0)), 0)
    multiplier = clampi(int(parsed.get("multiplier", 1)), 1, 5)
    best_score = maxi(int(parsed.get("best_score", score)), score)
    level_complete = bool(parsed.get("level_complete", false))
    sector_unlocked = bool(parsed.get("sector_unlocked", level_complete))
    var max_index := maxi(campaign.size() - 1, 0)
    campaign_index = clampi(int(parsed.get("campaign_index", 0)), 0, max_index)

func _save_progress() -> void:
    best_score = maxi(best_score, score)
    var data := {
        "version": 1,
        "score": score,
        "multiplier": multiplier,
        "campaign_index": campaign_index,
        "best_score": best_score,
        "level_complete": level_complete,
        "sector_unlocked": sector_unlocked
    }
    var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if file != null:
        file.store_string(JSON.stringify(data))

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

    chain_points.clear()
    for point in current_mission.get("checkpoints", []):
        if point is Array and point.size() >= 2:
            chain_points.append(Vector2(float(point[0]), float(point[1])))
    chain_index = 0
    chain_radius = float(current_mission.get("checkpoint_radius", 90.0))
    chain_speed = float(current_mission.get("checkpoint_speed", 110.0))
    chain_heat = int(current_mission.get("checkpoint_heat", 1))

func _build_hud() -> void:
    var layer := CanvasLayer.new()
    layer.layer = 20
    add_child(layer)

    hud_panel = ColorRect.new()
    hud_panel.anchor_left = 1.0
    hud_panel.anchor_right = 1.0
    hud_panel.offset_left = -475.0
    hud_panel.offset_right = -18.0
    hud_panel.offset_top = 18.0
    hud_panel.offset_bottom = 188.0
    hud_panel.color = Color(0.04, 0.04, 0.04, 0.88)
    hud_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    layer.add_child(hud_panel)

    hud_label = Label.new()
    hud_label.offset_left = 14.0
    hud_label.offset_top = 10.0
    hud_label.offset_right = 444.0
    hud_label.offset_bottom = 160.0
    hud_label.add_theme_font_size_override("font_size", 16)
    hud_panel.add_child(hud_label)

func _build_completion_overlay() -> void:
    var layer := CanvasLayer.new()
    layer.layer = 40
    add_child(layer)

    completion_panel = ColorRect.new()
    completion_panel.anchor_left = 0.5
    completion_panel.anchor_top = 0.5
    completion_panel.anchor_right = 0.5
    completion_panel.anchor_bottom = 0.5
    completion_panel.offset_left = -285.0
    completion_panel.offset_top = -120.0
    completion_panel.offset_right = 285.0
    completion_panel.offset_bottom = 120.0
    completion_panel.color = Color(0.04, 0.055, 0.07, 0.96)
    completion_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    completion_panel.visible = false
    layer.add_child(completion_panel)

    completion_label = Label.new()
    completion_label.offset_left = 24.0
    completion_label.offset_top = 24.0
    completion_label.offset_right = 546.0
    completion_label.offset_bottom = 215.0
    completion_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    completion_label.add_theme_font_size_override("font_size", 22)
    completion_panel.add_child(completion_label)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\nDOWNTOWN ACCESS + CROSSTOWN UNLOCKED\n\nSCORE %07d   BEST %07d   x%d" % [
        score, best_score, multiplier
    ]
    completion_panel.visible = true
    completion_overlay_timer = 5.5

func _process(delta: float) -> void:
    if game == null:
        return

    if completion_overlay_timer > 0.0:
        completion_overlay_timer = max(completion_overlay_timer - delta, 0.0)
        if completion_overlay_timer <= 0.0 and completion_panel != null:
            completion_panel.visible = false

    var current_lives := int(game.lives)
    if current_lives < last_lives and _mission_is_active():
        _fail_mission("MISSION FAILED — LOST A LIFE")
    last_lives = current_lives

    if mission_cooldown > 0.0:
        mission_cooldown = max(mission_cooldown - delta, 0.0)
        if mission_cooldown <= 0.0:
            mission_state = "available"
            _load_current_mission()
            _save_progress()
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
    elif mission_state == "chain_steal":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — COURIER CAR LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _fail_mission("MISSION FAILED — COURIER CAR DESTROYED")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "chain_drive"
            _set_game_message("COURIER CAR ACQUIRED — HIT CHECKPOINT 1/%d" % chain_points.size(), 2.2)
    elif mission_state == "chain_drive":
        _update_chain_run()

    _refresh_hud()

func _mission_is_active() -> bool:
    return mission_state in ["steal", "deliver", "destroy", "escape", "chain_steal", "chain_drive"]

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
        "checkpoint_run":
            if chain_points.is_empty():
                mission_state = "cooldown"
                mission_cooldown = 2.0
                _set_game_message("MISSION FAILED — NO CHECKPOINTS", 2.0)
                return
            chain_index = 0
            mission_state = "chain_steal"
            _spawn_target_vehicle()
            _set_game_message("%s — STEAL THE GREEN COURIER CAR" % _title(), 2.4)
        _:
            mission_state = "cooldown"
            mission_cooldown = 2.0
            _set_game_message("MISSION TYPE NOT SUPPORTED", 2.0)

func _update_chain_run() -> void:
    if not is_instance_valid(mission_target_vehicle):
        _fail_mission("MISSION FAILED — COURIER CAR LOST")
        return
    if mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
        _fail_mission("MISSION FAILED — COURIER CAR DESTROYED")
        return
    if not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    if chain_index < 0 or chain_index >= chain_points.size():
        _complete_mission()
        return

    var checkpoint := chain_points[chain_index]
    if mission_target_vehicle.global_position.distance_to(checkpoint) > chain_radius:
        return
    if mission_target_vehicle.get_forward_speed_abs() > chain_speed:
        return

    if chain_heat > 0 and chain_index < chain_points.size() - 1:
        game._raise_wanted(chain_heat)
    chain_index += 1
    if chain_index >= chain_points.size():
        _complete_mission()
    else:
        _set_game_message("CHECKPOINT %d/%d — KEEP MOVING" % [chain_index, chain_points.size()], 1.8)

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
    chain_index = 0

    campaign_index += 1
    if campaign_index >= campaign.size():
        var first_clear := not level_complete and score >= level_target_score
        if score >= level_target_score:
            level_complete = true
            sector_unlocked = true
        campaign_index = 0
        mission_state = "campaign_complete"
        mission_cooldown = 5.0
        best_score = maxi(best_score, score)
        _save_progress()
        if first_clear:
            _show_unlock_overlay()
        var target_note := " — LEVEL CLEARED" if level_complete else ""
        _set_game_message("CAMPAIGN COMPLETE  +%d%s" % [reward, target_note], 4.0)
    else:
        _load_current_mission()
        mission_state = "cooldown"
        mission_cooldown = 3.0
        _save_progress()
        _set_game_message("MISSION COMPLETE  +%d — NEXT: %s" % [reward, _title()], 3.0)

func _fail_mission(message: String) -> void:
    mission_state = "cooldown"
    mission_cooldown = 3.0
    mission_timer = 0.0
    mission_target_vehicle = null
    chain_index = 0
    _save_progress()
    _set_game_message(message, 2.2)

func _set_game_message(message: String, duration: float) -> void:
    game.status_message = message
    game.status_message_timer = duration

func _title() -> String:
    return str(current_mission.get("title", "MISSION"))

func _objective_text() -> String:
    if mission_state in ["available", "menu", "menu_wait"]:
        return "MISSION TERMINAL — CHOOSE A JOB"
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
    if mission_state == "chain_steal":
        return "STEAL THE GREEN COURIER CAR"
    if mission_state == "chain_drive":
        return "CHECKPOINT %d/%d — SLOW BELOW %d" % [mini(chain_index + 1, chain_points.size()), chain_points.size(), int(chain_speed)]
    if mission_state == "campaign_complete":
        if level_complete:
            return "LEVEL COMPLETE — CROSSTOWN UNLOCKED"
        return "MINI CAMPAIGN COMPLETE"
    return "MISSION PHONE REOPENING..."

func _refresh_hud() -> void:
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 6", "BUILD 12")
    if hud_label == null:
        return
    var mission_number := mini(campaign_index + 1, campaign.size())
    var timer_text := ""
    if _mission_is_active() and time_limit > 0.0:
        timer_text = "   TIME %02d" % int(ceil(mission_timer))
    var unlock_text := "3 CORE JOBS"
    if level_complete:
        unlock_text = "CROSSTOWN UNLOCKED"
    hud_label.text = "BUILD 12 — JOB %d/%d — %s\n%s%s\nSCORE %07d   TARGET %05d   x%d\nBEST %07d   SAVE ✓   %s" % [
        mission_number, campaign.size(), _title(), _objective_text(), timer_text,
        score, level_target_score, multiplier, best_score, unlock_text
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

func get_chain_checkpoint_position() -> Vector2:
    if chain_index >= 0 and chain_index < chain_points.size():
        return chain_points[chain_index]
    return Vector2.ZERO

func get_chain_checkpoint_number() -> int:
    return mini(chain_index + 1, chain_points.size())

func get_chain_checkpoint_count() -> int:
    return chain_points.size()

func is_level_complete() -> bool:
    return level_complete

func is_sector_unlocked() -> bool:
    return sector_unlocked
