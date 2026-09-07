extends "res://scripts/mission_director_build28.gd"

const BUILD29_PATH := "res://data/build29_campaign.json"
const CHAPTER_SAVE29 := "user://gta1_build29_chapter.json"
const HOSTILE_SCRIPT29 = preload("res://scripts/hostile_build29.gd")

var crossfire_staging29 := Vector2(1800.0, 0.0)
var crossfire_hostile_data29: Array = []
var crossfire_hostiles29: Array[CharacterBody2D] = []
var crossfire_smg_ammo29 := 120
var crossfire_armor29 := 4
var crossfire_escape_wanted29 := 4

var chapter_title29 := "CHAPTER ONE — COAST TO COAST"
var chapter_ids29: Array[String] = ["airmail", "lockdown", "runway_raid", "three_fronts", "crossfire"]
var chapter_active29 := false
var chapter_stage29 := 0
var chapter_pending29 := false
var chapter_starting29 := false

func _load_campaign() -> void:
    super._load_campaign()
    if not FileAccess.file_exists(BUILD29_PATH):
        return
    var file := FileAccess.open(BUILD29_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    var extra: Dictionary = parsed.get("mission", {})
    if not extra.is_empty():
        var found := false
        for mission in campaign:
            if str(mission.get("id", "")) == str(extra.get("id", "crossfire")):
                found = true
                break
        if not found:
            campaign.append(extra)
    var chapter: Dictionary = parsed.get("chapter", {})
    if not chapter.is_empty():
        chapter_title29 = str(chapter.get("title", chapter_title29))
        chapter_ids29.clear()
        for value in chapter.get("mission_ids", []):
            chapter_ids29.append(str(value))

func _ready() -> void:
    super._ready()
    _load_chapter29()
    if chapter_active29:
        chapter_pending29 = true
        _set_game_message("CHAPTER ONE READY — STAGE %d/%d" % [chapter_stage29 + 1, chapter_ids29.size()], 2.0)

func _load_current_mission() -> void:
    super._load_current_mission()
    crossfire_hostile_data29.clear()
    if str(current_mission.get("id", "")) != "crossfire":
        return
    crossfire_staging29 = _point_from_array(current_mission.get("staging_position", [1800.0, 0.0]))
    for entry in current_mission.get("hostiles", []):
        if entry is Dictionary:
            crossfire_hostile_data29.append(entry)
    crossfire_smg_ammo29 = maxi(int(current_mission.get("smg_ammo", 120)), 1)
    crossfire_armor29 = maxi(int(current_mission.get("armor", 4)), 1)
    crossfire_escape_wanted29 = clampi(int(current_mission.get("escape_wanted", 4)), 0, 4)

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["crossfire_staging", "crossfire_hostiles", "crossfire_escape"]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "crossfire":
        super._start_mission()
        return
    if crossfire_hostile_data29.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — CROSSFIRE HOSTILES MISSING", 2.0)
        return
    _cleanup_crossfire29()
    mission_timer = time_limit
    mission_state = "crossfire_staging"
    _set_game_message("CROSSFIRE — REACH DOWNTOWN STAGING", 2.5)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null:
        return

    if str(current_mission.get("id", "")) == "crossfire" and float(game.respawn_timer) <= 0.0:
        if mission_state == "crossfire_staging":
            if not bool(game.in_vehicle) and game.player.global_position.distance_to(crossfire_staging29) <= 50.0:
                if game.has_method("grant_smg28"):
                    game.grant_smg28(crossfire_smg_ammo29)
                if game.has_method("grant_combat_armor29"):
                    game.grant_combat_armor29(crossfire_armor29)
                _spawn_crossfire29()
                _set_wanted_at_least(2)
                mission_state = "crossfire_hostiles"
                _set_game_message("AMBUSH ACTIVE — HOSTILES ARE ARMED", 2.5)
        elif mission_state == "crossfire_hostiles":
            if crossfire_hostiles29.is_empty():
                _fail_mission("MISSION FAILED — HOSTILES LOST")
                return
            if _crossfire_alive29() <= 0:
                _set_wanted_at_least(crossfire_escape_wanted29)
                mission_state = "crossfire_escape"
                _set_game_message("HOSTILES DOWN — FOUR-HEAD ESCAPE", 2.5)
        elif mission_state == "crossfire_escape" and int(game.wanted_level) <= 0:
            _complete_mission()

    if chapter_active29 and chapter_pending29 and mission_state == "available" and mission_cooldown <= 0.0 and float(game.respawn_timer) <= 0.0:
        _launch_chapter_stage29()
    _refresh_hud()

func _spawn_crossfire29() -> void:
    _cleanup_crossfire29()
    for i in range(crossfire_hostile_data29.size()):
        var entry: Dictionary = crossfire_hostile_data29[i]
        var spawn := _point_from_array(entry.get("spawn", [1800.0, 0.0]))
        var covers: Array[Vector2] = []
        for point in entry.get("cover", []):
            covers.append(_point_from_array(point))
        var hostile = HOSTILE_SCRIPT29.new()
        hostile.name = "MissionHostile_CROSSFIRE_%02d" % (i + 1)
        var collision := CollisionShape2D.new()
        var shape := CircleShape2D.new()
        shape.radius = 9.0
        collision.shape = shape
        hostile.add_child(collision)
        game.add_child(hostile)
        hostile.configure_hostile(game, spawn, covers, int(entry.get("health", 6)), i)
        game.pedestrians.append(hostile)
        crossfire_hostiles29.append(hostile)

func _cleanup_crossfire29() -> void:
    for hostile in crossfire_hostiles29:
        if not is_instance_valid(hostile):
            continue
        if game != null and game.pedestrians.has(hostile):
            game.pedestrians.erase(hostile)
        hostile.queue_free()
    crossfire_hostiles29.clear()

func _crossfire_alive29() -> int:
    var count := 0
    for hostile in crossfire_hostiles29:
        if is_instance_valid(hostile) and (not hostile.has_method("is_mission_dead") or not hostile.is_mission_dead()):
            count += 1
    return count

func _complete_mission() -> void:
    var completed_id := str(current_mission.get("id", ""))
    var chapter_match := chapter_active29 and completed_id == _chapter_expected_id29()
    if completed_id == "crossfire":
        var reward := base_reward * multiplier
        score += reward
        multiplier = mini(multiplier + 1, 5)
        mission_timer = 0.0
        _cleanup_crossfire29()
        campaign_index = 0
        _load_current_mission()
        mission_state = "cooldown"
        mission_cooldown = 3.8
        _save_progress()
        _set_game_message("CROSSFIRE COMPLETE — HOSTILES CLEARED  +%d" % reward, 3.8)
    else:
        super._complete_mission()
    if chapter_match:
        _advance_chapter29()

func _fail_mission(message: String) -> void:
    var failed_id := str(current_mission.get("id", ""))
    var chapter_match := chapter_active29 and failed_id == _chapter_expected_id29()
    if failed_id == "crossfire":
        _cleanup_crossfire29()
    super._fail_mission(message)
    if chapter_match:
        chapter_pending29 = true
        _save_chapter29()
        _set_game_message("%s — CHAPTER CHECKPOINT HELD" % message, 2.5)

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "crossfire":
        if mission_state == "crossfire_staging":
            return "1/3 REACH DOWNTOWN STAGING"
        if mission_state == "crossfire_hostiles":
            var armor := game.get_combat_armor29() if game != null and game.has_method("get_combat_armor29") else 0
            return "2/3 CLEAR ARMED HOSTILES %d/%d — ARMOR %d" % [crossfire_hostile_data29.size() - _crossfire_alive29(), crossfire_hostile_data29.size(), armor]
        if mission_state == "crossfire_escape":
            return "3/3 FOUR-HEAD ESCAPE — LOSE ALL HEAT"
    return super._objective_text()

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n15 POST-CLEAR JOBS + CHAPTER ONE UNLOCKED\nWEST RIDGE + AIRFIELD + HARBOR EAST OPEN\n\nARMED HOSTILES + COVER AI + COAST TO COAST ONLINE\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 28", "BUILD 29")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 28", "BUILD 29")
        if chapter_active29:
            hud_label.text += "\nCHAPTER %d/%d — %s" % [chapter_stage29 + 1, chapter_ids29.size(), _chapter_expected_id29().replace("_", " ").to_upper()]

func begin_chapter29() -> void:
    if not level_complete or chapter_ids29.is_empty():
        _set_game_message("CHAPTER LOCKED — CLEAR THE CORE LEVEL FIRST", 2.2)
        return
    if not chapter_active29:
        chapter_active29 = true
        chapter_stage29 = 0
    chapter_pending29 = false
    chapter_starting29 = true
    var index := _campaign_index_for_id29(_chapter_expected_id29())
    if index < 0:
        chapter_starting29 = false
        return
    campaign_index = index
    mission_state = "available"
    mission_cooldown = 0.0
    mission_timer = 0.0
    mission_target_vehicle = null
    chain_index = 0
    _load_current_mission()
    _save_progress()
    _save_chapter29()
    chapter_starting29 = false
    _start_mission()
    _set_game_message("%s — STAGE %d/%d" % [chapter_title29, chapter_stage29 + 1, chapter_ids29.size()], 2.5)

func suspend_chapter29() -> void:
    if not chapter_active29:
        return
    chapter_active29 = false
    chapter_pending29 = false
    _save_chapter29()
    _set_game_message("CHAPTER RUN SUSPENDED", 1.4)

func is_chapter_active29() -> bool:
    return chapter_active29

func is_chapter_starting29() -> bool:
    return chapter_starting29

func get_chapter_status29() -> String:
    if chapter_active29:
        return "RESUME %d/%d" % [chapter_stage29 + 1, chapter_ids29.size()]
    return "START CHAPTER"

func get_chapter_title29() -> String:
    return chapter_title29

func _advance_chapter29() -> void:
    chapter_stage29 += 1
    if chapter_stage29 >= chapter_ids29.size():
        chapter_active29 = false
        chapter_pending29 = false
        chapter_stage29 = 0
        _save_chapter29()
        _set_game_message("CHAPTER ONE COMPLETE — COAST TO COAST", 4.0)
        return
    chapter_pending29 = true
    _save_chapter29()
    _set_game_message("CHAPTER CHECKPOINT — NEXT %s" % _chapter_expected_id29().replace("_", " ").to_upper(), 2.8)

func _launch_chapter_stage29() -> void:
    var index := _campaign_index_for_id29(_chapter_expected_id29())
    if index < 0:
        return
    chapter_pending29 = false
    campaign_index = index
    _load_current_mission()
    _save_progress()
    _save_chapter29()
    _start_mission()
    _set_game_message("%s — STAGE %d/%d" % [chapter_title29, chapter_stage29 + 1, chapter_ids29.size()], 2.4)

func _chapter_expected_id29() -> String:
    if chapter_ids29.is_empty():
        return ""
    return chapter_ids29[clampi(chapter_stage29, 0, chapter_ids29.size() - 1)]

func _campaign_index_for_id29(id: String) -> int:
    for i in range(campaign.size()):
        if str(campaign[i].get("id", "")) == id:
            return i
    return -1

func _load_chapter29() -> void:
    if not FileAccess.file_exists(CHAPTER_SAVE29):
        return
    var file := FileAccess.open(CHAPTER_SAVE29, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    chapter_active29 = bool(parsed.get("active", false))
    chapter_stage29 = clampi(int(parsed.get("stage", 0)), 0, maxi(chapter_ids29.size() - 1, 0))
    chapter_pending29 = bool(parsed.get("pending", chapter_active29))

func _save_chapter29() -> void:
    var file := FileAccess.open(CHAPTER_SAVE29, FileAccess.WRITE)
    if file != null:
        file.store_string(JSON.stringify({"active": chapter_active29, "stage": chapter_stage29, "pending": chapter_pending29}))

func get_crossfire_staging29() -> Vector2:
    return crossfire_staging29

func get_crossfire_positions29() -> Array[Vector2]:
    var result: Array[Vector2] = []
    for hostile in crossfire_hostiles29:
        if is_instance_valid(hostile):
            result.append(hostile.global_position)
    return result

func get_crossfire_alive29() -> Array[bool]:
    var result: Array[bool] = []
    for hostile in crossfire_hostiles29:
        result.append(is_instance_valid(hostile) and (not hostile.has_method("is_mission_dead") or not hostile.is_mission_dead()))
    return result
