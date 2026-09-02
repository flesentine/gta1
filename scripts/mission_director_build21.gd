extends "res://scripts/mission_director_build20.gd"

var perfect_signal_eligible := true
var perfect_damage_eligible := true
var perfect_signal_bonus := 0
var perfect_damage_bonus := 0
var perfect_start_health := 0

func _load_current_mission() -> void:
    super._load_current_mission()
    if str(current_mission.get("id", "")) == "perfect_line":
        perfect_signal_bonus = maxi(int(current_mission.get("signal_bonus", 2000)), 0)
        perfect_damage_bonus = maxi(int(current_mission.get("damage_bonus", 3000)), 0)
    else:
        perfect_signal_bonus = 0
        perfect_damage_bonus = 0
    perfect_signal_eligible = true
    perfect_damage_eligible = true
    perfect_start_health = 0

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "perfect_line":
        super._start_mission()
        return
    if chain_points.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — PERFECT LINE ROUTE MISSING", 2.0)
        return
    chain_index = 0
    mission_timer = time_limit
    perfect_signal_eligible = true
    perfect_damage_eligible = true
    mission_state = "chain_steal"
    _spawn_target_vehicle()
    if is_instance_valid(mission_target_vehicle) and mission_target_vehicle.has_method("get_health_pair"):
        perfect_start_health = int(mission_target_vehicle.get_health_pair().x)
    _set_game_message("PERFECT LINE — STEAL THE PINK COURIER", 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "perfect_line":
        return
    if mission_state != "chain_drive" or not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    var manager = game.get_node_or_null("WorldManager")
    if perfect_signal_eligible and manager != null and manager.has_method("get_red_signal_violation"):
        if bool(manager.get_red_signal_violation(mission_target_vehicle, 95.0)):
            perfect_signal_eligible = false
            _set_game_message("SIGNAL BONUS LOST — RED LIGHT", 2.0)
    if perfect_damage_eligible and is_instance_valid(mission_target_vehicle) and mission_target_vehicle.has_method("get_health_pair"):
        if int(mission_target_vehicle.get_health_pair().x) < perfect_start_health:
            perfect_damage_eligible = false
            _set_game_message("DAMAGE BONUS LOST — COURIER HIT", 2.0)

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "perfect_line":
        super._complete_mission()
        return
    var signal_reward := perfect_signal_bonus if perfect_signal_eligible else 0
    var damage_reward := perfect_damage_bonus if perfect_damage_eligible else 0
    var reward := (base_reward + signal_reward + damage_reward) * multiplier
    var signal_text := "SIGNAL ✓" if perfect_signal_eligible else "SIGNAL ×"
    var damage_text := "DAMAGE ✓" if perfect_damage_eligible else "DAMAGE ×"
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    chain_index = 0
    campaign_index = 0
    perfect_signal_eligible = true
    perfect_damage_eligible = true
    perfect_start_health = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.0
    _save_progress()
    _set_game_message("PERFECT LINE COMPLETE — %s · %s  +%d" % [signal_text, damage_text, reward], 3.6)

func _fail_mission(message: String) -> void:
    perfect_signal_eligible = true
    perfect_damage_eligible = true
    perfect_start_health = 0
    super._fail_mission(message)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n8 POST-CLEAR JOBS UNLOCKED\nHARBOR EAST + DOCKLANDS OPEN\n\nPERFECT LINE HAS 2 INDEPENDENT BONUSES\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "perfect_line":
        var signal_text := "SIGNAL ✓" if perfect_signal_eligible else "SIGNAL ×"
        var damage_text := "DAMAGE ✓" if perfect_damage_eligible else "DAMAGE ×"
        if mission_state == "chain_steal":
            return "STEAL THE PINK COURIER — %s · %s" % [signal_text, damage_text]
        if mission_state == "chain_drive":
            return "PERFECT STOP %d/%d — %s · %s" % [mini(chain_index + 1, chain_points.size()), chain_points.size(), signal_text, damage_text]
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 20", "BUILD 21")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 20", "BUILD 21")
        hud_label.text = hud_label.text.replace("7 POST-CLEAR JOBS UNLOCKED", "8 POST-CLEAR JOBS UNLOCKED")
