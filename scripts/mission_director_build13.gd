extends "res://scripts/mission_director.gd"

var mixed_drop_rect := Rect2()
var mixed_package_position := Vector2.ZERO
var mixed_drop_speed := 75.0
var mixed_escape_wanted := 3

func _load_current_mission() -> void:
    super._load_current_mission()
    var drop = current_mission.get("drop_rect", [0.0, 0.0, 0.0, 0.0])
    if drop is Array and drop.size() >= 4:
        mixed_drop_rect = Rect2(float(drop[0]), float(drop[1]), float(drop[2]), float(drop[3]))
    else:
        mixed_drop_rect = Rect2()
    var package = current_mission.get("package_position", [0.0, 0.0])
    if package is Array and package.size() >= 2:
        mixed_package_position = Vector2(float(package[0]), float(package[1]))
    else:
        mixed_package_position = Vector2.ZERO
    mixed_drop_speed = float(current_mission.get("drop_speed", 75.0))
    mixed_escape_wanted = int(current_mission.get("escape_wanted", 3))

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in [
        "mixed_steal", "mixed_drive", "mixed_package", "mixed_escape"
    ]

func _start_mission() -> void:
    if mission_type != "mixed_run":
        super._start_mission()
        return
    mission_timer = time_limit
    mission_state = "mixed_steal"
    _spawn_target_vehicle()
    _set_game_message("%s — STEAL THE PURPLE GETAWAY CAR" % _title(), 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or float(game.respawn_timer) > 0.0:
        return

    if mission_state == "mixed_steal":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — GETAWAY CAR LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _fail_mission("MISSION FAILED — GETAWAY CAR DESTROYED")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "mixed_drive"
            _set_game_message("CAR ACQUIRED — DRIVE TO THE PURPLE DROP LOT", 2.0)
    elif mission_state == "mixed_drive":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — GETAWAY CAR LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _fail_mission("MISSION FAILED — GETAWAY CAR DESTROYED")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if mixed_drop_rect.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= mixed_drop_speed:
                mission_state = "mixed_package"
                _set_game_message("PARKED — GET OUT AND GRAB THE PACKAGE", 2.2)
    elif mission_state == "mixed_package":
        if not is_instance_valid(mission_target_vehicle):
            _fail_mission("MISSION FAILED — GETAWAY CAR LOST")
        elif mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
            _fail_mission("MISSION FAILED — GETAWAY CAR DESTROYED")
        elif not bool(game.in_vehicle) and game.player.global_position.distance_to(mixed_package_position) <= 34.0:
            mission_state = "mixed_escape"
            _set_wanted_at_least(mixed_escape_wanted)
            _set_game_message("PACKAGE SECURED — LOSE THE COPS", 2.4)
    elif mission_state == "mixed_escape":
        if int(game.wanted_level) <= 0:
            _complete_mission()

    _refresh_hud()

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "dead_drop":
        super._complete_mission()
        return

    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.0
    _save_progress()
    _set_game_message("DEAD DROP COMPLETE  +%d" % reward, 3.0)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\nDOWNTOWN + CROSSTOWN + DEAD DROP UNLOCKED\n\nSCORE %07d   BEST %07d   x%d" % [
        score, best_score, multiplier
    ]
    completion_panel.visible = true
    completion_overlay_timer = 5.5

func _objective_text() -> String:
    if mission_state == "mixed_steal":
        return "STEAL THE PURPLE GETAWAY CAR"
    if mission_state == "mixed_drive":
        return "PARK GETAWAY CAR IN PURPLE DROP LOT"
    if mission_state == "mixed_package":
        return "GET OUT — GRAB THE PACKAGE"
    if mission_state == "mixed_escape":
        return "PACKAGE SECURED — LOSE ALL HEAT"
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 12", "BUILD 13")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 12", "BUILD 13")
        hud_label.text = hud_label.text.replace("CROSSTOWN UNLOCKED", "2 POST-CLEAR JOBS UNLOCKED")

func get_mixed_drop_rect() -> Rect2:
    return mixed_drop_rect

func get_mixed_package_position() -> Vector2:
    return mixed_package_position
