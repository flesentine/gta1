extends "res://scripts/mission_director_build27.gd"

const FRONT_TARGET_SCRIPT28 = preload("res://scripts/mission_target_build15.gd")

var front_armory28 := Vector2(4100.0, -1200.0)
var front_positions28: Array[Vector2] = []
var front_target28: CharacterBody2D = null
var front_index28 := 0
var front_health28 := 6
var front_smg_ammo28 := 90
var front_escape_wanted28 := 4

func _load_current_mission() -> void:
    super._load_current_mission()
    front_positions28.clear()
    front_index28 = 0
    if str(current_mission.get("id", "")) != "three_fronts":
        return
    front_armory28 = _point_from_array(current_mission.get("armory_position", [4100.0, -1200.0]))
    for item in current_mission.get("target_positions", []):
        front_positions28.append(_point_from_array(item))
    front_health28 = maxi(int(current_mission.get("target_health", 6)), 1)
    front_smg_ammo28 = maxi(int(current_mission.get("smg_ammo", 90)), 1)
    front_escape_wanted28 = clampi(int(current_mission.get("escape_wanted", 4)), 0, 4)

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["front_armory", "front_target", "front_escape"]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "three_fronts":
        super._start_mission()
        return
    if front_positions28.size() < 3:
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — THREE FRONTS TARGETS MISSING", 2.0)
        return
    _cleanup_front_target28()
    front_index28 = 0
    mission_timer = time_limit
    mission_state = "front_armory"
    _set_game_message("THREE FRONTS — REACH HARBOR EAST ARMORY", 2.6)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "three_fronts":
        return
    if not _mission_is_active() or float(game.respawn_timer) > 0.0:
        return

    if mission_state == "front_armory":
        if not bool(game.in_vehicle) and game.player.global_position.distance_to(front_armory28) <= 48.0:
            if game.has_method("grant_smg28"):
                game.grant_smg28(front_smg_ammo28)
            _spawn_front_target28(0)
            _set_wanted_at_least(2)
            mission_state = "front_target"
            _set_game_message("SMG READY — CLEAR HARBOR TARGET", 2.4)
    elif mission_state == "front_target":
        if not is_instance_valid(front_target28):
            _fail_mission("MISSION FAILED — FRONT TARGET LOST")
            return
        if front_target28.has_method("is_mission_dead") and front_target28.is_mission_dead():
            _cleanup_front_target28()
            front_index28 += 1
            if front_index28 >= front_positions28.size():
                _set_wanted_at_least(front_escape_wanted28)
                mission_state = "front_escape"
                _set_game_message("ALL FRONTS DOWN — FOUR-HEAD ESCAPE", 2.6)
            else:
                _set_wanted_at_least(mini(4, 2 + front_index28))
                _spawn_front_target28(front_index28)
                var names := ["HARBOR", "CENTRAL", "WEST RIDGE"]
                _set_game_message("NEXT FRONT — %s" % names[front_index28], 2.2)
    elif mission_state == "front_escape":
        if int(game.wanted_level) <= 0:
            _complete_mission()
    _refresh_hud()

func _spawn_front_target28(index: int) -> void:
    _cleanup_front_target28()
    var center := front_positions28[clampi(index, 0, front_positions28.size() - 1)]
    var route := PackedVector2Array([
        center + Vector2(-80.0, 0.0), center + Vector2(0.0, -70.0),
        center + Vector2(80.0, 0.0), center + Vector2(0.0, 70.0)
    ])
    var colors := [Color(0.78, 0.24, 0.18), Color(0.76, 0.48, 0.16), Color(0.55, 0.25, 0.74)]
    var target = FRONT_TARGET_SCRIPT28.new()
    target.name = "MissionTarget_THREE_FRONTS_%02d" % (index + 1)
    var collision := CollisionShape2D.new()
    var shape := CircleShape2D.new()
    shape.radius = 9.0
    collision.shape = shape
    target.add_child(collision)
    game.add_child(target)
    target.configure_target(route, colors[index % colors.size()], front_health28)
    game.pedestrians.append(target)
    front_target28 = target

func _cleanup_front_target28() -> void:
    if is_instance_valid(front_target28):
        if game != null and game.pedestrians.has(front_target28):
            game.pedestrians.erase(front_target28)
        front_target28.queue_free()
    front_target28 = null

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "three_fronts":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_timer = 0.0
    _cleanup_front_target28()
    front_index28 = 0
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.6
    _save_progress()
    _set_game_message("THREE FRONTS COMPLETE — CITY RUN  +%d" % reward, 3.8)

func _fail_mission(message: String) -> void:
    if str(current_mission.get("id", "")) == "three_fronts":
        _cleanup_front_target28()
        front_index28 = 0
    super._fail_mission(message)

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "three_fronts":
        if mission_state == "front_armory":
            return "1/5 REACH HARBOR EAST ARMORY — GET THE SMG"
        if mission_state == "front_target":
            var names := ["HARBOR", "CENTRAL", "WEST RIDGE"]
            var weapon := game.get_weapon_text27() if game != null and game.has_method("get_weapon_text27") else "SMG"
            return "%d/5 CLEAR %s TARGET — %s" % [front_index28 + 2, names[front_index28], weapon]
        if mission_state == "front_escape":
            return "5/5 FOUR-HEAD ESCAPE — LOSE ALL HEAT"
    return super._objective_text()

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n14 POST-CLEAR JOBS UNLOCKED\nWEST RIDGE + AIRFIELD + HARBOR EAST OPEN\n\nFLAT BROWSER CORE + SMG + THREE FRONTS ONLINE\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 27", "BUILD 28")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 27", "BUILD 28")
        hud_label.text = hud_label.text.replace("13 POST-CLEAR JOBS UNLOCKED", "14 POST-CLEAR JOBS UNLOCKED")

func get_front_armory28() -> Vector2:
    return front_armory28

func get_front_target_position28() -> Vector2:
    if is_instance_valid(front_target28):
        return front_target28.global_position
    if front_positions28.is_empty():
        return Vector2.ZERO
    return front_positions28[clampi(front_index28, 0, front_positions28.size() - 1)]

func get_front_index28() -> int:
    return front_index28
