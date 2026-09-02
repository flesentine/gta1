extends "res://scripts/mission_director_build22.gd"

const HOT_SWAP_RECOVERY_TIME := 70.0

var hot_swap_recovery_armed := false
var hot_swap_recovery_used := false

func _load_current_mission() -> void:
    super._load_current_mission()
    if str(current_mission.get("id", "")) != "hot_swap":
        hot_swap_recovery_armed = false
        hot_swap_recovery_used = false

func _start_mission() -> void:
    if str(current_mission.get("id", "")) == "hot_swap":
        hot_swap_recovery_armed = false
        hot_swap_recovery_used = false
    super._start_mission()

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "hot_swap":
        return
    if mission_state == "swap_package" and not hot_swap_recovery_used and not hot_swap_recovery_armed:
        hot_swap_recovery_armed = true
        _set_game_message("HANDOFF CHECKPOINT ARMED — 1 RECOVERY", 2.1)
    _refresh_hud()

func _fail_mission(message: String) -> void:
    var late_stage := mission_state in ["swap_package", "swap_escape_steal", "swap_escape", "swap_deliver"]
    var can_recover := str(current_mission.get("id", "")) == "hot_swap" and hot_swap_recovery_armed and not hot_swap_recovery_used and late_stage
    if can_recover and not message.contains("LOST A LIFE") and game != null and float(game.respawn_timer) <= 0.0:
        _restore_hot_swap_checkpoint(message)
        return
    hot_swap_recovery_armed = false
    hot_swap_recovery_used = false
    super._fail_mission(message)

func _restore_hot_swap_checkpoint(reason: String) -> void:
    hot_swap_recovery_used = true
    hot_swap_recovery_armed = false

    if bool(game.in_vehicle) and is_instance_valid(game.current_vehicle) and game.has_method("_exit_vehicle"):
        game._exit_vehicle()

    if is_instance_valid(swap_escape_vehicle):
        game.vehicles.erase(swap_escape_vehicle)
        swap_escape_vehicle.queue_free()
    swap_escape_vehicle = null
    mission_target_vehicle = null

    game.wanted_level = 0
    game.wanted_decay_timer = 0.0
    if game.has_method("_clear_police"):
        game._clear_police()

    game.in_vehicle = false
    game.current_vehicle = null
    game.player.visible = true
    game.player.set_active(true)
    game.player.global_position = swap_package_position + Vector2(0.0, 52.0)

    chain_index = chain_points.size()
    mission_timer = max(mission_timer, HOT_SWAP_RECOVERY_TIME)
    mission_state = "swap_package"
    _set_game_message("HOT SWAP RECOVERY — HANDOFF RESTORED · 70 SEC", 3.0)

func _complete_mission() -> void:
    var was_hot_swap := str(current_mission.get("id", "")) == "hot_swap"
    super._complete_mission()
    if was_hot_swap:
        hot_swap_recovery_armed = false
        hot_swap_recovery_used = false

func _objective_text() -> String:
    var text := super._objective_text()
    if str(current_mission.get("id", "")) == "hot_swap" and mission_state in ["swap_package", "swap_escape_steal", "swap_escape", "swap_deliver"]:
        var recovery := "RECOVERY USED" if hot_swap_recovery_used else "RECOVERY READY" if hot_swap_recovery_armed else "RECOVERY —"
        return "%s — %s" % [text, recovery]
    return text

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n9 POST-CLEAR JOBS UNLOCKED\nHARBOR EAST + DOCKLANDS OPEN\n\nHOT SWAP HANDOFF CHECKPOINT ENABLED\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 22", "BUILD 23")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 22", "BUILD 23")

func is_hot_swap_recovery_armed() -> bool:
    return hot_swap_recovery_armed

func is_hot_swap_recovery_used() -> bool:
    return hot_swap_recovery_used
