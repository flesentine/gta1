extends "res://scripts/mission_director_build25.gd"

var lockdown_points26: Array[Vector2] = []
var lockdown_index26 := 0
var lockdown_radius26 := 105.0
var lockdown_speed26 := 125.0
var lockdown_heat26 := 1
var lockdown_start_wanted26 := 2
var lockdown_escape_wanted26 := 4
var lockdown_final26 := Rect2()
var lockdown_final_speed26 := 75.0

func _load_current_mission() -> void:
    super._load_current_mission()
    lockdown_points26.clear()
    lockdown_index26 = 0
    if str(current_mission.get("id", "")) != "lockdown":
        return
    for item in current_mission.get("checkpoints", []):
        lockdown_points26.append(_point_from_array(item))
    lockdown_radius26 = float(current_mission.get("checkpoint_radius", 105.0))
    lockdown_speed26 = float(current_mission.get("checkpoint_speed", 125.0))
    lockdown_heat26 = int(current_mission.get("checkpoint_heat", 1))
    lockdown_start_wanted26 = int(current_mission.get("starting_wanted", 2))
    lockdown_escape_wanted26 = int(current_mission.get("escape_wanted", 4))
    lockdown_final26 = _rect_from_array(current_mission.get("final_delivery_rect", [0.0, 0.0, 0.0, 0.0]))
    lockdown_final_speed26 = float(current_mission.get("final_speed", 75.0))

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["lockdown_steal", "lockdown_run", "lockdown_escape", "lockdown_deliver"]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "lockdown":
        super._start_mission()
        return
    if lockdown_points26.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — LOCKDOWN ROUTE MISSING", 2.0)
        return
    mission_timer = time_limit
    lockdown_index26 = 0
    mission_state = "lockdown_steal"
    _spawn_target_vehicle()
    _set_game_message("LOCKDOWN — STEAL THE BLACK WEST RIDGE RUNNER", 2.5)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "lockdown":
        return
    if not _mission_is_active() or float(game.respawn_timer) > 0.0:
        return
    if mission_state == "lockdown_steal":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            _set_wanted_at_least(lockdown_start_wanted26)
            mission_state = "lockdown_run"
            _set_game_message("RUNNER ACQUIRED — WEST RIDGE GATES", 2.2)
    elif mission_state == "lockdown_run":
        _update_lockdown26()
    elif mission_state == "lockdown_escape":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif int(game.wanted_level) <= 0:
            mission_state = "lockdown_deliver"
            _set_game_message("HEAT CLEARED — RETURN TO AIRFIELD SERVICE LOT", 2.4)
    elif mission_state == "lockdown_deliver":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if lockdown_final26.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= lockdown_final_speed26:
                _complete_mission()
    _refresh_hud()

func _update_lockdown26() -> void:
    if not _valid_mission_car():
        _fail_mission("MISSION FAILED — RUNNER LOST")
        return
    if not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    if lockdown_index26 >= lockdown_points26.size():
        _set_wanted_at_least(lockdown_escape_wanted26)
        mission_state = "lockdown_escape"
        return
    var point := lockdown_points26[lockdown_index26]
    if mission_target_vehicle.global_position.distance_to(point) > lockdown_radius26:
        return
    if mission_target_vehicle.get_forward_speed_abs() > lockdown_speed26:
        return
    if lockdown_heat26 > 0:
        game._raise_wanted(lockdown_heat26)
    lockdown_index26 += 1
    if lockdown_index26 >= lockdown_points26.size():
        _set_wanted_at_least(lockdown_escape_wanted26)
        mission_state = "lockdown_escape"
        _set_game_message("LEVEL 4 LOCKDOWN — EVADE SPIKES + BOX UNITS", 2.6)
    else:
        _set_game_message("RIDGE GATE %d/%d" % [lockdown_index26, lockdown_points26.size()], 1.6)

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "lockdown":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    lockdown_index26 = 0
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.4
    _save_progress()
    _set_game_message("LOCKDOWN COMPLETE — AIRFIELD SECURED  +%d" % reward, 3.6)

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "lockdown":
        var tires := _current_tires26()
        if mission_state == "lockdown_steal": return "1/4 STEAL THE BLACK WEST RIDGE RUNNER"
        if mission_state == "lockdown_run": return "2/4 RIDGE GATE %d/%d — TIRES %d/4" % [mini(lockdown_index26 + 1, lockdown_points26.size()), lockdown_points26.size(), tires]
        if mission_state == "lockdown_escape": return "3/4 LEVEL 4 — EVADE SPIKES + BOX UNITS — TIRES %d/4" % tires
        if mission_state == "lockdown_deliver": return "4/4 RETURN RUNNER TO AIRFIELD SERVICE LOT"
    return super._objective_text()

func _current_tires26() -> int:
    if game == null:
        return 0
    var manager = game.get_node_or_null("WorldManager")
    if manager != null and manager.has_method("get_current_tire_damage26"):
        return int(manager.get_current_tire_damage26())
    return 0

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n12 POST-CLEAR JOBS UNLOCKED\nWEST RIDGE + AIRFIELD + HARBOR EAST OPEN\n\nLEVEL 4 NOW DEPLOYS SPIKES + BOX-IN UNITS\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 25", "BUILD 26")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 25", "BUILD 26")
        hud_label.text = hud_label.text.replace("11 POST-CLEAR JOBS UNLOCKED", "12 POST-CLEAR JOBS UNLOCKED")

func get_lockdown_current_point26() -> Vector2:
    if lockdown_points26.is_empty():
        return Vector2.ZERO
    return lockdown_points26[clampi(lockdown_index26, 0, lockdown_points26.size() - 1)]

func get_lockdown_final26() -> Rect2:
    return lockdown_final26
