extends "res://scripts/mission_director_build19.gd"

var green_wave_bonus_eligible := true
var green_wave_bonus_reward := 0

func _load_current_mission() -> void:
    super._load_current_mission()
    if str(current_mission.get("id", "")) == "green_wave":
        green_wave_bonus_reward = maxi(int(current_mission.get("bonus_reward", 2500)), 0)
    else:
        green_wave_bonus_reward = 0
    green_wave_bonus_eligible = true

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "green_wave":
        super._start_mission()
        return
    if chain_points.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — GREEN WAVE ROUTE MISSING", 2.0)
        return
    chain_index = 0
    mission_timer = time_limit
    green_wave_bonus_eligible = true
    mission_state = "chain_steal"
    _spawn_target_vehicle()
    _set_game_message("GREEN WAVE — STEAL THE GREEN COURIER", 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null:
        return
    if str(current_mission.get("id", "")) != "green_wave":
        return
    if mission_state != "chain_drive":
        return
    if not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    if not green_wave_bonus_eligible:
        return
    var manager = game.get_node_or_null("WorldManager")
    if manager != null and manager.has_method("get_red_signal_violation"):
        if bool(manager.get_red_signal_violation(mission_target_vehicle, 95.0)):
            green_wave_bonus_eligible = false
            _set_game_message("BONUS LOST — RED LIGHT VIOLATION", 2.2)

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "green_wave":
        super._complete_mission()
        return
    var bonus := green_wave_bonus_reward if green_wave_bonus_eligible else 0
    var reward := (base_reward + bonus) * multiplier
    var clean := green_wave_bonus_eligible
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    chain_index = 0
    campaign_index = 0
    green_wave_bonus_eligible = true
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.0
    _save_progress()
    var suffix := " + CLEAN BONUS" if clean else ""
    _set_game_message("GREEN WAVE COMPLETE%s  +%d" % [suffix, reward], 3.4)

func _fail_mission(message: String) -> void:
    green_wave_bonus_eligible = true
    super._fail_mission(message)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n7 POST-CLEAR JOBS UNLOCKED\nHARBOR EAST + DOCKLANDS OPEN\n\nGREEN WAVE CLEAN BONUS AVAILABLE\n\nSCORE %07d   BEST %07d   x%d" % [
        score, best_score, multiplier
    ]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "green_wave":
        if mission_state == "chain_steal":
            return "STEAL THE GREEN COURIER"
        if mission_state == "chain_drive":
            var bonus_text := "BONUS CLEAN" if green_wave_bonus_eligible else "BONUS LOST"
            return "GREEN STOP %d/%d — %s" % [
                mini(chain_index + 1, chain_points.size()), chain_points.size(), bonus_text
            ]
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 19", "BUILD 20")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 19", "BUILD 20")
        hud_label.text = hud_label.text.replace("6 POST-CLEAR JOBS UNLOCKED", "7 POST-CLEAR JOBS UNLOCKED")

func is_green_wave_bonus_eligible() -> bool:
    return green_wave_bonus_eligible

func get_green_wave_bonus_reward() -> int:
    return green_wave_bonus_reward
