extends "res://scripts/mission_director_build23.gd"

var parallel_objectives: Array[Vector2] = []
var parallel_labels: Array[String] = []
var parallel_done: Array[bool] = []
var parallel_radius := 105.0
var parallel_speed := 115.0
var parallel_heat := 1
var parallel_escape_wanted := 3
var parallel_final_delivery := Rect2()
var parallel_final_speed := 80.0

func _load_current_mission() -> void:
    super._load_current_mission()
    parallel_objectives.clear()
    parallel_labels.clear()
    parallel_done.clear()
    if str(current_mission.get("id", "")) != "twin_strike":
        return
    for item in current_mission.get("parallel_objectives", []):
        parallel_objectives.append(_point_from_array(item))
    for label in current_mission.get("parallel_labels", []):
        parallel_labels.append(str(label))
    while parallel_labels.size() < parallel_objectives.size():
        parallel_labels.append("CACHE %d" % [parallel_labels.size() + 1])
    parallel_done.resize(parallel_objectives.size())
    parallel_done.fill(false)
    parallel_radius = float(current_mission.get("parallel_radius", 105.0))
    parallel_speed = float(current_mission.get("parallel_speed", 115.0))
    parallel_heat = int(current_mission.get("parallel_heat", 1))
    parallel_escape_wanted = int(current_mission.get("escape_wanted", 3))
    parallel_final_delivery = _rect_from_array(current_mission.get("final_delivery_rect", [0.0,0.0,0.0,0.0]))
    parallel_final_speed = float(current_mission.get("final_speed", 80.0))

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["parallel_steal", "parallel_targets", "parallel_escape", "parallel_deliver"]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "twin_strike":
        super._start_mission()
        return
    if parallel_objectives.size() < 2:
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — TWIN STRIKE OBJECTIVES MISSING", 2.0)
        return
    parallel_done.fill(false)
    mission_timer = time_limit
    mission_state = "parallel_steal"
    _spawn_target_vehicle()
    _set_game_message("TWIN STRIKE — STEAL THE ORANGE RUNNER", 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "twin_strike":
        return
    if not _mission_is_active() or float(game.respawn_timer) > 0.0:
        return
    if mission_state == "parallel_steal":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "parallel_targets"
            _set_game_message("RUNNER ACQUIRED — HIT BOTH CACHES IN ANY ORDER", 2.2)
    elif mission_state == "parallel_targets":
        _update_parallel_targets24()
    elif mission_state == "parallel_escape":
        if int(game.wanted_level) <= 0:
            mission_state = "parallel_deliver"
            _set_game_message("HEAT CLEARED — RETURN RUNNER TO DOWNTOWN SAFEHOUSE", 2.4)
    elif mission_state == "parallel_deliver":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if parallel_final_delivery.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= parallel_final_speed:
                _complete_mission()
    _refresh_hud()

func _update_parallel_targets24() -> void:
    if not _valid_mission_car():
        _fail_mission("MISSION FAILED — RUNNER LOST")
        return
    if not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    for i in range(parallel_objectives.size()):
        if parallel_done[i]:
            continue
        if mission_target_vehicle.global_position.distance_to(parallel_objectives[i]) > parallel_radius:
            continue
        if mission_target_vehicle.get_forward_speed_abs() > parallel_speed:
            continue
        parallel_done[i] = true
        if parallel_heat > 0:
            game._raise_wanted(parallel_heat)
        _set_game_message("%s CLEARED — %d/%d" % [parallel_labels[i], _parallel_count24(), parallel_objectives.size()], 1.8)
    if _parallel_count24() == parallel_objectives.size():
        _set_wanted_at_least(parallel_escape_wanted)
        mission_state = "parallel_escape"
        _set_game_message("BOTH CACHES CLEARED — LOSE THE COPS", 2.4)

func _parallel_count24() -> int:
    var count := 0
    for done in parallel_done:
        if done:
            count += 1
    return count

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "twin_strike":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    parallel_done.fill(false)
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.2
    _save_progress()
    _set_game_message("TWIN STRIKE COMPLETE — BOTH CACHES  +%d" % reward, 3.5)

func _fail_mission(message: String) -> void:
    if str(current_mission.get("id", "")) == "twin_strike":
        parallel_done.fill(false)
    super._fail_mission(message)

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "twin_strike":
        if mission_state == "parallel_steal": return "1/4 STEAL THE ORANGE RUNNER"
        if mission_state == "parallel_targets":
            var west := "WEST ✓" if parallel_done.size() > 0 and parallel_done[0] else "WEST ○"
            var east := "HARBOR ✓" if parallel_done.size() > 1 and parallel_done[1] else "HARBOR ○"
            return "2/4 HIT BOTH CACHES — %s · %s" % [west, east]
        if mission_state == "parallel_escape": return "3/4 BOTH CACHES HIT — LOSE THE COPS"
        if mission_state == "parallel_deliver": return "4/4 RETURN RUNNER TO DOWNTOWN SAFEHOUSE"
    return super._objective_text()

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null: return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n10 POST-CLEAR JOBS UNLOCKED\nHARBOR EAST + DOCKLANDS OPEN\n\nTWIN STRIKE OBJECTIVES CAN BE CLEARED IN EITHER ORDER\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null: game.hud_label.text = game.hud_label.text.replace("BUILD 23", "BUILD 24")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 23", "BUILD 24")
        hud_label.text = hud_label.text.replace("9 POST-CLEAR JOBS UNLOCKED", "10 POST-CLEAR JOBS UNLOCKED")

func get_parallel_objectives24() -> Array[Vector2]: return parallel_objectives
func get_parallel_done24() -> Array[bool]: return parallel_done
func get_parallel_labels24() -> Array[String]: return parallel_labels
func get_parallel_final_delivery24() -> Rect2: return parallel_final_delivery
