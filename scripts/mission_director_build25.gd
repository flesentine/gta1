extends "res://scripts/mission_director_build24.gd"

var airmail_points25: Array[Vector2] = []
var airmail_index25 := 0
var airmail_radius25 := 105.0
var airmail_speed25 := 125.0
var airmail_heat25 := 1
var airmail_final25 := Rect2()
var airmail_final_speed25 := 85.0

func _load_current_mission() -> void:
    super._load_current_mission()
    airmail_points25.clear()
    airmail_index25 = 0
    if str(current_mission.get("id", "")) != "airmail":
        return
    for item in current_mission.get("checkpoints", []):
        airmail_points25.append(_point_from_array(item))
    airmail_radius25 = float(current_mission.get("checkpoint_radius", 105.0))
    airmail_speed25 = float(current_mission.get("checkpoint_speed", 125.0))
    airmail_heat25 = int(current_mission.get("checkpoint_heat", 1))
    airmail_final25 = _rect_from_array(current_mission.get("final_delivery_rect", [0.0, 0.0, 0.0, 0.0]))
    airmail_final_speed25 = float(current_mission.get("final_speed", 85.0))

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["airmail_steal", "airmail_drive", "airmail_deliver"]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "airmail":
        super._start_mission()
        return
    if airmail_points25.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — AIRMAIL ROUTE MISSING", 2.0)
        return
    mission_timer = time_limit
    airmail_index25 = 0
    mission_state = "airmail_steal"
    _spawn_target_vehicle()
    _set_game_message("AIRMAIL — STEAL THE WHITE HARBOR COURIER", 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "airmail":
        return
    if not _mission_is_active() or float(game.respawn_timer) > 0.0:
        return
    if mission_state == "airmail_steal":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — COURIER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "airmail_drive"
            _set_game_message("COURIER ACQUIRED — CROSS THE CITY", 2.2)
    elif mission_state == "airmail_drive":
        _update_airmail25()
    elif mission_state == "airmail_deliver":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — COURIER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if airmail_final25.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= airmail_final_speed25:
                _complete_mission()
    _refresh_hud()

func _update_airmail25() -> void:
    if not _valid_mission_car():
        _fail_mission("MISSION FAILED — COURIER LOST")
        return
    if not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    if airmail_index25 >= airmail_points25.size():
        mission_state = "airmail_deliver"
        return
    var point := airmail_points25[airmail_index25]
    if mission_target_vehicle.global_position.distance_to(point) > airmail_radius25:
        return
    if mission_target_vehicle.get_forward_speed_abs() > airmail_speed25:
        return
    if airmail_heat25 > 0 and airmail_index25 < airmail_points25.size() - 1:
        game._raise_wanted(airmail_heat25)
    airmail_index25 += 1
    if airmail_index25 >= airmail_points25.size():
        mission_state = "airmail_deliver"
        _set_game_message("WEST RIDGE REACHED — DELIVER TO AIRFIELD", 2.4)
    else:
        _set_game_message("CROSS-CITY GATE %d/%d" % [airmail_index25, airmail_points25.size()], 1.6)

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "airmail":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    airmail_index25 = 0
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.3
    _save_progress()
    _set_game_message("AIRMAIL COMPLETE — AIRFIELD DELIVERY  +%d" % reward, 3.6)

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "airmail":
        if mission_state == "airmail_steal":
            return "1/3 STEAL THE WHITE HARBOR COURIER"
        if mission_state == "airmail_drive":
            return "2/3 CROSS-CITY GATE %d/%d" % [mini(airmail_index25 + 1, airmail_points25.size()), airmail_points25.size()]
        if mission_state == "airmail_deliver":
            return "3/3 DELIVER TO WEST RIDGE AIRFIELD"
    return super._objective_text()

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n11 POST-CLEAR JOBS UNLOCKED\nWEST RIDGE + AIRFIELD + HARBOR EAST OPEN\n\nAIRMAIL CROSSES THE FULL THREE-SECTOR CITY\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 24", "BUILD 25")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 24", "BUILD 25")
        hud_label.text = hud_label.text.replace("10 POST-CLEAR JOBS UNLOCKED", "11 POST-CLEAR JOBS UNLOCKED")

func get_airmail_current_point25() -> Vector2:
    if airmail_points25.is_empty():
        return Vector2.ZERO
    return airmail_points25[clampi(airmail_index25, 0, airmail_points25.size() - 1)]

func get_airmail_final25() -> Rect2:
    return airmail_final25
