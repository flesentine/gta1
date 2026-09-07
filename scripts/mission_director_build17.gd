extends "res://scripts/mission_director_build16.gd"

var branch_choice := ""
var branch_quiet_gate := Vector2.ZERO
var branch_hot_gate := Vector2.ZERO
var branch_choice_radius := 95.0
var branch_choice_speed := 120.0
var branch_quiet_delivery := Rect2()
var branch_hot_delivery := Rect2()
var branch_delivery_speed := 75.0
var branch_hot_wanted := 3
var branch_hot_bonus := 2000

func _load_current_mission() -> void:
    super._load_current_mission()
    branch_choice = ""
    branch_quiet_gate = _point_from(current_mission.get("quiet_gate", [0.0, 0.0]))
    branch_hot_gate = _point_from(current_mission.get("hot_gate", [0.0, 0.0]))
    branch_choice_radius = float(current_mission.get("choice_radius", 95.0))
    branch_choice_speed = float(current_mission.get("choice_speed", 120.0))
    branch_quiet_delivery = _rect_from(current_mission.get("quiet_delivery_rect", [0.0, 0.0, 0.0, 0.0]))
    branch_hot_delivery = _rect_from(current_mission.get("hot_delivery_rect", [0.0, 0.0, 0.0, 0.0]))
    branch_delivery_speed = float(current_mission.get("delivery_speed", 75.0))
    branch_hot_wanted = clampi(int(current_mission.get("hot_wanted", 3)), 0, 4)
    branch_hot_bonus = maxi(int(current_mission.get("hot_bonus", 2000)), 0)

func _point_from(value: Variant) -> Vector2:
    if value is Array and value.size() >= 2:
        return Vector2(float(value[0]), float(value[1]))
    return Vector2.ZERO

func _rect_from(value: Variant) -> Rect2:
    if value is Array and value.size() >= 4:
        return Rect2(float(value[0]), float(value[1]), float(value[2]), float(value[3]))
    return Rect2()

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in [
        "branch_steal", "branch_choose", "branch_deliver", "branch_escape"
    ]

func _start_mission() -> void:
    if mission_type != "branch_delivery":
        super._start_mission()
        return
    branch_choice = ""
    mission_timer = time_limit
    mission_state = "branch_steal"
    _spawn_target_vehicle()
    _set_game_message("%s — STEAL THE ORANGE RUNNER" % _title(), 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or float(game.respawn_timer) > 0.0:
        return

    if mission_state == "branch_steal":
        if not _branch_car_ok():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "branch_choose"
            _set_game_message("RUNNER ACQUIRED — GREEN QUIET / RED HOT", 2.5)

    elif mission_state == "branch_choose":
        if not _branch_car_ok():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if mission_target_vehicle.get_forward_speed_abs() <= branch_choice_speed:
                var position := mission_target_vehicle.global_position
                if position.distance_to(branch_quiet_gate) <= branch_choice_radius:
                    branch_choice = "quiet"
                    mission_state = "branch_deliver"
                    _set_game_message("QUIET ROUTE — DELIVER TO WAREHOUSE ROW", 2.5)
                elif position.distance_to(branch_hot_gate) <= branch_choice_radius:
                    branch_choice = "hot"
                    mission_state = "branch_deliver"
                    _set_wanted_at_least(branch_hot_wanted)
                    _set_game_message("HOT ROUTE — 3 HEADS — DELIVER DOWNTOWN", 2.5)

    elif mission_state == "branch_deliver":
        if not _branch_car_ok():
            _fail_mission("MISSION FAILED — RUNNER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            var target_rect := get_branch_delivery_rect()
            if target_rect.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= branch_delivery_speed:
                if branch_choice == "hot":
                    _set_wanted_at_least(branch_hot_wanted)
                    mission_state = "branch_escape"
                    _set_game_message("HOT DROP COMPLETE — LOSE THE COPS", 2.5)
                else:
                    _complete_mission()

    elif mission_state == "branch_escape":
        if int(game.wanted_level) <= 0:
            _complete_mission()

    _refresh_hud()

func _branch_car_ok() -> bool:
    if not is_instance_valid(mission_target_vehicle):
        return false
    if mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
        return false
    return true

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "crossroads":
        super._complete_mission()
        return

    var selected := branch_choice
    var bonus := branch_hot_bonus if selected == "hot" else 0
    var reward := (base_reward + bonus) * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    mission_timer = 0.0
    branch_choice = ""
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.0
    _save_progress()
    var route_name := "HOT ROUTE" if selected == "hot" else "QUIET ROUTE"
    _set_game_message("CROSSROADS COMPLETE — %s  +%d" % [route_name, reward], 3.2)

func _fail_mission(message: String) -> void:
    branch_choice = ""
    super._fail_mission(message)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n4 POST-CLEAR JOBS UNLOCKED\nCROSSTOWN · DEAD DROP · RED FLAG · CROSSROADS\n\nSCORE %07d   BEST %07d   x%d" % [
        score, best_score, multiplier
    ]
    completion_panel.visible = true
    completion_overlay_timer = 5.5

func _objective_text() -> String:
    if mission_state == "branch_steal":
        return "STEAL THE ORANGE RUNNER"
    if mission_state == "branch_choose":
        return "CHOOSE ROUTE — GREEN QUIET / RED HOT"
    if mission_state == "branch_deliver":
        if branch_choice == "hot":
            return "HOT ROUTE — DELIVER DOWNTOWN"
        return "QUIET ROUTE — DELIVER WAREHOUSE ROW"
    if mission_state == "branch_escape":
        return "HOT ROUTE — LOSE ALL HEAT"
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 16", "BUILD 17")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 16", "BUILD 17")
        hud_label.text = hud_label.text.replace("3 POST-CLEAR JOBS UNLOCKED", "4 POST-CLEAR JOBS UNLOCKED")

func get_branch_quiet_gate() -> Vector2:
    return branch_quiet_gate

func get_branch_hot_gate() -> Vector2:
    return branch_hot_gate

func get_branch_choice_radius() -> float:
    return branch_choice_radius

func get_branch_choice_speed() -> float:
    return branch_choice_speed

func get_branch_choice() -> String:
    return branch_choice

func get_branch_delivery_rect() -> Rect2:
    return branch_hot_delivery if branch_choice == "hot" else branch_quiet_delivery

func get_branch_delivery_speed() -> float:
    return branch_delivery_speed
