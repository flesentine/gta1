extends "res://scripts/mission_director_build18.gd"

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "night_shift":
        super._start_mission()
        return
    if chain_points.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — DOCK ROUTE MISSING", 2.0)
        return
    chain_index = 0
    mission_timer = time_limit
    mission_state = "chain_steal"
    _spawn_target_vehicle()
    _set_game_message("NIGHT SHIFT — STEAL THE YELLOW DOCK VAN", 2.4)

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "night_shift":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    chain_index = 0
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.0
    _save_progress()
    _set_game_message("NIGHT SHIFT COMPLETE — DOCKLANDS CLEARED  +%d" % reward, 3.2)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n6 POST-CLEAR JOBS UNLOCKED\nHARBOR EAST + DOCKLANDS OPEN\n\nSCORE %07d   BEST %07d   x%d" % [
        score, best_score, multiplier
    ]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "night_shift":
        if mission_state == "chain_steal":
            return "STEAL THE YELLOW DOCK VAN"
        if mission_state == "chain_drive":
            return "DOCK STOP %d/%d — SLOW BELOW %d" % [
                mini(chain_index + 1, chain_points.size()), chain_points.size(), int(chain_speed)
            ]
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 18", "BUILD 19")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 18", "BUILD 19")
        hud_label.text = hud_label.text.replace("5 POST-CLEAR JOBS UNLOCKED", "6 POST-CLEAR JOBS UNLOCKED")
