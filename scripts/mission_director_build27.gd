extends "res://scripts/mission_director_build26.gd"

const RAID_TARGET_SCRIPT27 = preload("res://scripts/mission_target_build15.gd")

var raid_armory27 := Vector2(-4100.0, 1200.0)
var raid_target_positions27: Array[Vector2] = []
var raid_targets27: Array[CharacterBody2D] = []
var raid_target_health27 := 7
var raid_shells27 := 12
var raid_escape_wanted27 := 4

func _load_current_mission() -> void:
    super._load_current_mission()
    raid_target_positions27.clear()
    if str(current_mission.get("id", "")) != "runway_raid":
        return
    raid_armory27 = _point_from_array(current_mission.get("armory_position", [-4100.0, 1200.0]))
    for item in current_mission.get("target_positions", []):
        raid_target_positions27.append(_point_from_array(item))
    raid_target_health27 = maxi(int(current_mission.get("target_health", 7)), 1)
    raid_shells27 = maxi(int(current_mission.get("shotgun_shells", 12)), 1)
    raid_escape_wanted27 = clampi(int(current_mission.get("escape_wanted", 4)), 0, 4)

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["raid_armory", "raid_targets", "raid_escape"]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "runway_raid":
        super._start_mission()
        return
    if raid_target_positions27.size() < 3:
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — RUNWAY RAID TARGETS MISSING", 2.0)
        return
    _cleanup_raid_targets27()
    mission_timer = time_limit
    mission_state = "raid_armory"
    _set_game_message("RUNWAY RAID — REACH THE AIRFIELD ARMORY", 2.5)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "runway_raid":
        return
    if not _mission_is_active() or float(game.respawn_timer) > 0.0:
        return

    if mission_state == "raid_armory":
        if not bool(game.in_vehicle) and game.player.global_position.distance_to(raid_armory27) <= 48.0:
            if game.has_method("grant_shotgun27"):
                game.grant_shotgun27(raid_shells27)
            _spawn_raid_targets27()
            _set_wanted_at_least(2)
            mission_state = "raid_targets"
            _set_game_message("SHOTGUN READY — CLEAR ALL THREE TARGETS", 2.4)
    elif mission_state == "raid_targets":
        if raid_targets27.is_empty():
            _fail_mission("MISSION FAILED — TARGETS LOST")
            return
        if _raid_alive_count27() <= 0:
            _set_wanted_at_least(raid_escape_wanted27)
            mission_state = "raid_escape"
            _set_game_message("TARGETS DOWN — FOUR-HEAD ESCAPE", 2.5)
    elif mission_state == "raid_escape":
        if int(game.wanted_level) <= 0:
            _complete_mission()
    _refresh_hud()

func _spawn_raid_targets27() -> void:
    _cleanup_raid_targets27()
    var colors := [Color(0.86, 0.22, 0.22), Color(0.82, 0.30, 0.15), Color(0.72, 0.15, 0.36)]
    for i in range(raid_target_positions27.size()):
        var center := raid_target_positions27[i]
        var route := PackedVector2Array([
            center + Vector2(-70.0, 0.0), center + Vector2(0.0, -65.0),
            center + Vector2(70.0, 0.0), center + Vector2(0.0, 65.0)
        ])
        var target = RAID_TARGET_SCRIPT27.new()
        target.name = "MissionTarget_RUNWAY_RAID_%02d" % (i + 1)
        var collision := CollisionShape2D.new()
        var shape := CircleShape2D.new()
        shape.radius = 9.0
        collision.shape = shape
        target.add_child(collision)
        game.add_child(target)
        target.configure_target(route, colors[i % colors.size()], raid_target_health27)
        game.pedestrians.append(target)
        raid_targets27.append(target)

func _cleanup_raid_targets27() -> void:
    for target in raid_targets27:
        if not is_instance_valid(target):
            continue
        if game != null and game.pedestrians.has(target):
            game.pedestrians.erase(target)
        target.queue_free()
    raid_targets27.clear()

func _raid_alive_count27() -> int:
    var count := 0
    for target in raid_targets27:
        if not is_instance_valid(target):
            continue
        if not target.has_method("is_mission_dead") or not target.is_mission_dead():
            count += 1
    return count

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "runway_raid":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_timer = 0.0
    _cleanup_raid_targets27()
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.4
    _save_progress()
    _set_game_message("RUNWAY RAID COMPLETE — AIRFIELD CLEARED  +%d" % reward, 3.6)

func _fail_mission(message: String) -> void:
    if str(current_mission.get("id", "")) == "runway_raid":
        _cleanup_raid_targets27()
    super._fail_mission(message)

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "runway_raid":
        if mission_state == "raid_armory":
            return "1/3 REACH AIRFIELD ARMORY — GET THE SHOTGUN"
        if mission_state == "raid_targets":
            var weapon := game.get_weapon_text27() if game != null and game.has_method("get_weapon_text27") else "SHOTGUN"
            return "2/3 CLEAR TARGETS %d/3 — %s" % [3 - _raid_alive_count27(), weapon]
        if mission_state == "raid_escape":
            return "3/3 FOUR-HEAD ESCAPE — LOSE ALL HEAT"
    return super._objective_text()

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n13 POST-CLEAR JOBS UNLOCKED\nWEST RIDGE + AIRFIELD + HARBOR EAST OPEN\n\nSHOTGUN COMBAT + RUNWAY RAID ONLINE\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 26", "BUILD 27")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 26", "BUILD 27")
        hud_label.text = hud_label.text.replace("12 POST-CLEAR JOBS UNLOCKED", "13 POST-CLEAR JOBS UNLOCKED")

func get_raid_armory27() -> Vector2:
    return raid_armory27

func get_raid_target_positions27() -> Array[Vector2]:
    var result: Array[Vector2] = []
    for i in range(raid_target_positions27.size()):
        if i < raid_targets27.size() and is_instance_valid(raid_targets27[i]):
            result.append(raid_targets27[i].global_position)
        else:
            result.append(raid_target_positions27[i])
    return result

func get_raid_target_alive27() -> Array[bool]:
    var result: Array[bool] = []
    for i in range(raid_target_positions27.size()):
        var alive := false
        if i < raid_targets27.size() and is_instance_valid(raid_targets27[i]):
            var target = raid_targets27[i]
            alive = not target.has_method("is_mission_dead") or not target.is_mission_dead()
        result.append(alive)
    return result
