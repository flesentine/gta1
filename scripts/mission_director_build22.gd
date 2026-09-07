extends "res://scripts/mission_director_build21.gd"

var swap_handoff_rect := Rect2()
var swap_package_position := Vector2.ZERO
var swap_handoff_speed := 70.0
var swap_escape_spawn := Vector2.ZERO
var swap_escape_color := Color(0.14, 0.16, 0.18)
var swap_escape_wanted := 3
var swap_final_delivery := Rect2()
var swap_final_speed := 75.0
var swap_escape_vehicle: CharacterBody2D = null

func _load_current_mission() -> void:
    super._load_current_mission()
    if str(current_mission.get("id", "")) != "hot_swap":
        swap_escape_vehicle = null
        return
    swap_handoff_rect = _rect_from_array(current_mission.get("handoff_rect", [0.0, 0.0, 0.0, 0.0]))
    swap_package_position = _point_from_array(current_mission.get("package_position", [0.0, 0.0]))
    swap_handoff_speed = float(current_mission.get("handoff_speed", 70.0))
    swap_escape_spawn = _point_from_array(current_mission.get("escape_vehicle_spawn", [0.0, 0.0]))
    var color = current_mission.get("escape_vehicle_color", [0.14, 0.16, 0.18])
    if color is Array and color.size() >= 3:
        swap_escape_color = Color(float(color[0]), float(color[1]), float(color[2]))
    swap_escape_wanted = int(current_mission.get("escape_wanted", 3))
    swap_final_delivery = _rect_from_array(current_mission.get("final_delivery_rect", [0.0, 0.0, 0.0, 0.0]))
    swap_final_speed = float(current_mission.get("final_speed", 75.0))
    swap_escape_vehicle = null

func _rect_from_array(value: Variant) -> Rect2:
    if value is Array and value.size() >= 4:
        return Rect2(float(value[0]), float(value[1]), float(value[2]), float(value[3]))
    return Rect2()

func _point_from_array(value: Variant) -> Vector2:
    if value is Array and value.size() >= 2:
        return Vector2(float(value[0]), float(value[1]))
    return Vector2.ZERO

func _mission_is_active() -> bool:
    return super._mission_is_active() or mission_state in [
        "swap_steal", "swap_drive", "swap_handoff", "swap_package",
        "swap_escape_steal", "swap_escape", "swap_deliver"
    ]

func _start_mission() -> void:
    if str(current_mission.get("id", "")) != "hot_swap":
        super._start_mission()
        return
    if chain_points.is_empty():
        mission_state = "cooldown"
        mission_cooldown = 2.0
        _set_game_message("MISSION FAILED — HOT SWAP ROUTE MISSING", 2.0)
        return
    chain_index = 0
    mission_timer = time_limit
    swap_escape_vehicle = null
    mission_state = "swap_steal"
    _spawn_target_vehicle()
    _set_game_message("HOT SWAP — STEAL THE TEAL COURIER", 2.4)

func _process(delta: float) -> void:
    super._process(delta)
    if game == null or str(current_mission.get("id", "")) != "hot_swap":
        return
    if not _mission_is_active() or float(game.respawn_timer) > 0.0:
        return

    if mission_state == "swap_steal":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — COURIER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "swap_drive"
            chain_index = 0
            _set_game_message("COURIER ACQUIRED — RUN THE HARBOR GATES", 2.0)
    elif mission_state == "swap_drive":
        _update_swap_checkpoints()
    elif mission_state == "swap_handoff":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — COURIER LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if swap_handoff_rect.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= swap_handoff_speed:
                mission_state = "swap_package"
                _set_game_message("PARKED — GET OUT AND TAKE THE PACKAGE", 2.2)
    elif mission_state == "swap_package":
        if not bool(game.in_vehicle) and game.player.global_position.distance_to(swap_package_position) <= 34.0:
            _spawn_swap_escape_vehicle()
            _set_wanted_at_least(swap_escape_wanted)
            mission_state = "swap_escape_steal"
            _set_game_message("PACKAGE SECURED — STEAL THE BLACK ESCAPE CAR", 2.4)
    elif mission_state == "swap_escape_steal":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — ESCAPE CAR LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            mission_state = "swap_escape"
            _set_game_message("ESCAPE CAR ACQUIRED — LOSE THE COPS", 2.2)
    elif mission_state == "swap_escape":
        if int(game.wanted_level) <= 0:
            mission_state = "swap_deliver"
            _set_game_message("HEAT CLEARED — RETURN TO DOWNTOWN SAFEHOUSE", 2.4)
    elif mission_state == "swap_deliver":
        if not _valid_mission_car():
            _fail_mission("MISSION FAILED — ESCAPE CAR LOST")
        elif bool(game.in_vehicle) and game.current_vehicle == mission_target_vehicle:
            if swap_final_delivery.has_point(mission_target_vehicle.global_position) and mission_target_vehicle.get_forward_speed_abs() <= swap_final_speed:
                _complete_mission()

    _refresh_hud()

func _valid_mission_car() -> bool:
    if not is_instance_valid(mission_target_vehicle):
        return false
    if mission_target_vehicle.has_method("is_destroyed") and mission_target_vehicle.is_destroyed():
        return false
    return true

func _update_swap_checkpoints() -> void:
    if not _valid_mission_car():
        _fail_mission("MISSION FAILED — COURIER LOST")
        return
    if not bool(game.in_vehicle) or game.current_vehicle != mission_target_vehicle:
        return
    if chain_index >= chain_points.size():
        mission_state = "swap_handoff"
        return
    var checkpoint := chain_points[chain_index]
    if mission_target_vehicle.global_position.distance_to(checkpoint) > chain_radius:
        return
    if mission_target_vehicle.get_forward_speed_abs() > chain_speed:
        return
    if chain_heat > 0 and chain_index < chain_points.size() - 1:
        game._raise_wanted(chain_heat)
    chain_index += 1
    if chain_index >= chain_points.size():
        mission_state = "swap_handoff"
        _set_game_message("HARBOR GATES CLEARED — PARK IN THE HANDOFF LOT", 2.2)
    else:
        _set_game_message("HARBOR GATE %d/%d — KEEP MOVING" % [chain_index, chain_points.size()], 1.8)

func _spawn_swap_escape_vehicle() -> void:
    var car = VEHICLE_SCRIPT.new()
    car.name = "MissionTarget_hot_swap_escape"
    var collision := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = Vector2(34, 64)
    collision.shape = shape
    car.add_child(collision)
    game.add_child(car)
    car.global_position = swap_escape_spawn
    car.rotation = PI * 0.5
    car.set_body_color(swap_escape_color)
    car.set_parked()
    car.add_to_group("vehicles")
    game.vehicles.append(car)
    swap_escape_vehicle = car
    mission_target_vehicle = car

func _complete_mission() -> void:
    if str(current_mission.get("id", "")) != "hot_swap":
        super._complete_mission()
        return
    var reward := base_reward * multiplier
    score += reward
    multiplier = mini(multiplier + 1, 5)
    mission_target_vehicle = null
    swap_escape_vehicle = null
    mission_timer = 0.0
    chain_index = 0
    campaign_index = 0
    _load_current_mission()
    mission_state = "cooldown"
    mission_cooldown = 3.2
    _save_progress()
    _set_game_message("HOT SWAP COMPLETE — FULL HANDOFF  +%d" % reward, 3.6)

func _fail_mission(message: String) -> void:
    swap_escape_vehicle = null
    super._fail_mission(message)

func _show_unlock_overlay() -> void:
    if completion_panel == null or completion_label == null:
        return
    completion_label.text = "LEVEL COMPLETE\nCENTRAL DISTRICT CLEARED\n\n9 POST-CLEAR JOBS UNLOCKED\nHARBOR EAST + DOCKLANDS OPEN\n\nHOT SWAP ADDS A 7-STAGE JOB CHAIN\n\nSCORE %07d   BEST %07d   x%d" % [score, best_score, multiplier]
    completion_panel.visible = true
    completion_overlay_timer = 6.0

func _objective_text() -> String:
    if str(current_mission.get("id", "")) == "hot_swap":
        if mission_state == "swap_steal":
            return "1/7 STEAL THE TEAL COURIER"
        if mission_state == "swap_drive":
            return "2/7 HARBOR RUN %d/%d" % [mini(chain_index + 1, chain_points.size()), chain_points.size()]
        if mission_state == "swap_handoff":
            return "3/7 PARK IN THE HANDOFF LOT"
        if mission_state == "swap_package":
            return "4/7 GET OUT — GRAB THE PACKAGE"
        if mission_state == "swap_escape_steal":
            return "5/7 STEAL THE BLACK ESCAPE CAR"
        if mission_state == "swap_escape":
            return "6/7 LOSE THE COPS"
        if mission_state == "swap_deliver":
            return "7/7 DELIVER ESCAPE CAR TO DOWNTOWN SAFEHOUSE"
    return super._objective_text()

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 21", "BUILD 22")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 21", "BUILD 22")
        hud_label.text = hud_label.text.replace("8 POST-CLEAR JOBS UNLOCKED", "9 POST-CLEAR JOBS UNLOCKED")

func get_hot_swap_handoff_rect() -> Rect2:
    return swap_handoff_rect

func get_hot_swap_package_position() -> Vector2:
    return swap_package_position

func get_hot_swap_final_delivery() -> Rect2:
    return swap_final_delivery

func get_hot_swap_current_checkpoint() -> Vector2:
    if chain_points.is_empty():
        return Vector2.ZERO
    return chain_points[clampi(chain_index, 0, chain_points.size() - 1)]

func get_hot_swap_escape_vehicle() -> CharacterBody2D:
    return swap_escape_vehicle
