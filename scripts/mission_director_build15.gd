extends "res://scripts/mission_director_build13.gd"

const TARGET_SCRIPT = preload("res://scripts/mission_target_build15.gd")

var character_target: CharacterBody2D = null
var character_target_route := PackedVector2Array()
var character_target_color := Color(0.84, 0.16, 0.28)
var character_target_health := 4
var character_target_ammo := 16
var character_target_escape_wanted := 3

func _load_current_mission() -> void:
    super._load_current_mission()
    character_target_route = PackedVector2Array()
    for point in current_mission.get("target_route", []):
        if point is Array and point.size() >= 2:
            character_target_route.append(Vector2(float(point[0]), float(point[1])))
    var color = current_mission.get("target_color", [0.84, 0.16, 0.28])
    if color is Array and color.size() >= 3:
        character_target_color = Color(float(color[0]), float(color[1]), float(color[2]))
    character_target_health = maxi(int(current_mission.get("target_health", 4)), 1)
    character_target_ammo = maxi(int(current_mission.get("mission_ammo", 16)), 0)
    character_target_escape_wanted = clampi(int(current_mission.get("escape_wanted", 3)), 0, 4)

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in ["hunt_target", "hunt_escape"]

func _start_mission() -> void:
    if mission_type != "character_target":
        super._start_mission()
        return
    if character_target_route.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — TARGET ROUTE MISSING", 2.0)
        return
    _cleanup_character_target()
    mission_timer = time_limit
    game.pistol_owned = true
    game.pistol_ammo = maxi(int(game.pistol_ammo), character_target_ammo)
    _spawn_character_target()
    mission_state = "hunt_target"
    _set_game_message("%s — FIND THE MARKED TARGET" % _title(), 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or float(game.respawn_timer) > 0.0:
        return

    if mission_state == "hunt_target":
        if not is_instance_valid(character_target):
            _fail_mission("MISSION FAILED — TARGET LOST")
        elif character_target.has_method("is_mission_dead") and character_target.is_mission_dead():
            mission_state = "hunt_escape"
            _set_wanted_at_least(character_target_escape_wanted)
            _set_game_message("TARGET DOWN — LOSE THE COPS", 2.4)
    elif mission_state == "hunt_escape":
        if int(game.wanted_level) <= 0:
            _complete_mission()

    _refresh_hud()

func _spawn_character_target() -> void:
    var target = TARGET_SCRIPT.new()
    target.name = "MissionTarget_RED_FLAG"
    var collision := CollisionShape2D.new()
    var shape := CircleShape2D.new()
    shape.radius = 9.0
    collision.shape = shape
    target.add_child(collision)
    game.add_child(target)
    target.configure_target(character_target_route, character_target_color, character_target_health)
    game.pedestrians.append(target)
    character_target = target

func _cleanup_character_target() -> void:
    if is_instance_valid(character_target):
        if game != null and game.pedestrians.has(character_target):
            game.pedestrians.erase(character_target)
        character_target.queue_free()
    character_target = null

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "red_flag":
        super._complete_mission()
        return

    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_timer = 0.0
    _cleanup_character_target()
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.0
    _save_progress()
    _set_game_message("RED FLAG COMPLETE  +%d" % reward, 3.0)

func _fail_mission(message: String) -> void:
    _cleanup_character_target()
    super._fail_mission(message)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n3 POST-CLEAR JOBS UNLOCKED\nCROSSTOWN · DEAD DROP · RED FLAG\n\nSCORE %07d   BEST %07d   x%d" % [
        score, best_score, multiplier
    ]
    completion_panel.visible = true
    completion_overlay_timer = 5.5

func _objective_text() -> String:
    if mission_state == "hunt_target":
        return "FIND + TAKE DOWN THE MARKED TARGET"
    if mission_state == "hunt_escape":
        return "TARGET DOWN — LOSE ALL HEAT"
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 12", "BUILD 15").replace("BUILD 13", "BUILD 15")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 12", "BUILD 15").replace("BUILD 13", "BUILD 15")
        hud_label.text = hud_label.text.replace("2 POST-CLEAR JOBS UNLOCKED", "3 POST-CLEAR JOBS UNLOCKED")

func get_character_target() -> CharacterBody2D:
    return character_target

func get_character_target_position() -> Vector2:
    if is_instance_valid(character_target):
        return character_target.global_position
    return Vector2.ZERO
