extends Node

const CITY_PATH := "res://data/city_sector.json"
const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")

var game: Node
var director: Node
var retire_ages: Dictionary = {}
var traffic_routes: Array[PackedVector2Array] = []
var traffic_floor := 15
var traffic_serial := 0
var respawn_cooldown := 0.0
var scan_accumulator := 0.0
var retired_count := 0

func _ready() -> void:
    game = get_parent()
    director = game.get_node_or_null("MissionDirector") if game != null else null
    _load_routes()
    call_deferred("_decorate_population")

func _process(delta: float) -> void:
    if game == null:
        return
    respawn_cooldown = max(respawn_cooldown - delta, 0.0)
    scan_accumulator += delta
    if scan_accumulator < 0.20:
        return
    var step := scan_accumulator
    scan_accumulator = 0.0
    _decorate_population()
    _pace_traffic()
    _cleanup_entities(step)
    _maintain_traffic()

func _load_routes() -> void:
    if not FileAccess.file_exists(CITY_PATH):
        return
    var file := FileAccess.open(CITY_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    traffic_routes = _route_array(parsed.get("outer_traffic_routes", []))
    if traffic_routes.is_empty():
        traffic_routes = _route_array(parsed.get("traffic_routes", []))

func _route_array(items: Variant) -> Array[PackedVector2Array]:
    var result: Array[PackedVector2Array] = []
    if not items is Array:
        return result
    for item in items:
        if not item is Array:
            continue
        var route := PackedVector2Array()
        for point in item:
            if point is Array and point.size() >= 2:
                route.append(Vector2(float(point[0]), float(point[1])))
        if route.size() >= 2:
            result.append(route)
    return result

func _decorate_population() -> void:
    if game == null:
        return
    var now := Time.get_ticks_msec() / 1000.0
    for ped in game.pedestrians:
        if not is_instance_valid(ped) or ped.is_in_group("mission_targets"):
            continue
        if not ped.has_meta("build16_archetype"):
            var kind := int(ped.get_instance_id() % 4)
            match kind:
                0:
                    ped.set_meta("build16_archetype", "COMMUTER")
                    ped.set("walk_speed", max(float(ped.get("walk_speed")), 72.0))
                1:
                    ped.set_meta("build16_archetype", "CAUTIOUS")
                    ped.set("threat_radius", max(float(ped.get("threat_radius")), 235.0))
                    ped.set("panic_speed", max(float(ped.get("panic_speed")), 205.0))
                2:
                    ped.set_meta("build16_archetype", "STROLLER")
                    ped.set_meta("build16_walk_speed", min(float(ped.get("walk_speed")), 48.0))
                    ped.set_meta("build16_next_pause", now + 3.0 + float(ped.get_instance_id() % 5) * 0.7)
                    ped.set_meta("build16_pause_until", 0.0)
                _:
                    ped.set_meta("build16_archetype", "JOGGER")
                    ped.set("walk_speed", max(float(ped.get("walk_speed")), 96.0))
                    ped.set("panic_speed", max(float(ped.get("panic_speed")), 215.0))
        if str(ped.get_meta("build16_archetype", "")) == "STROLLER":
            var pause_until := float(ped.get_meta("build16_pause_until", 0.0))
            var next_pause := float(ped.get_meta("build16_next_pause", now + 6.0))
            var base_speed := float(ped.get_meta("build16_walk_speed", 46.0))
            if now < pause_until:
                ped.set("walk_speed", 0.0)
            else:
                ped.set("walk_speed", base_speed)
                if now >= next_pause:
                    ped.set_meta("build16_pause_until", now + 0.75)
                    ped.set_meta("build16_next_pause", now + 6.0 + float(ped.get_instance_id() % 4) * 0.8)

func _pace_traffic() -> void:
    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value == null or not bool(ai_value):
            continue
        if car.has_method("is_destroyed") and car.is_destroyed():
            continue
        if not car.has_meta("build16_base_cruise"):
            car.set_meta("build16_base_cruise", float(car.get("ai_cruise_speed")))
        var factor := _traffic_factor(car)
        var base_cruise := float(car.get_meta("build16_base_cruise", 200.0))
        car.set("ai_cruise_speed", base_cruise * factor)
        car.set_meta("build16_braking", factor < 0.72)

func _traffic_factor(car: Node2D) -> float:
    var forward := Vector2.UP.rotated(car.rotation)
    var nearest := INF
    for other in game.vehicles:
        if not is_instance_valid(other) or other == car:
            continue
        if other.has_method("is_destroyed") and other.is_destroyed():
            continue
        var offset: Vector2 = other.global_position - car.global_position
        var distance := offset.length()
        if distance < 1.0 or distance > 185.0:
            continue
        if forward.dot(offset / distance) < 0.78:
            continue
        nearest = min(nearest, distance)
    if nearest < 54.0:
        return 0.08
    if nearest < 88.0:
        return 0.30
    if nearest < 128.0:
        return 0.58
    if nearest < 165.0:
        return 0.78
    return 1.0

func _cleanup_entities(delta: float) -> void:
    var player_target: Node2D = game._player_target() if game.has_method("_player_target") else null
    var active_target = director.get("mission_target_vehicle") if director != null else null
    for car in game.vehicles.duplicate():
        if not is_instance_valid(car):
            game.vehicles.erase(car)
            continue
        if car == game.current_vehicle or car == active_target:
            retire_ages.erase(car.get_instance_id())
            continue
        var distance := player_target.global_position.distance_to(car.global_position) if is_instance_valid(player_target) else INF
        var limit := INF
        var name_text := str(car.name)
        if name_text.begins_with("MissionTarget_"):
            limit = 4.0
        elif car.has_method("is_destroyed") and car.is_destroyed() and distance > 420.0:
            limit = 11.0
        else:
            var ai_value = car.get("ai_enabled")
            var controlled_value = car.get("controlled")
            if name_text != "Car" and ai_value != null and controlled_value != null:
                if not bool(ai_value) and not bool(controlled_value) and distance > 1250.0:
                    limit = 24.0
        var id := car.get_instance_id()
        if is_inf(limit):
            retire_ages.erase(id)
            continue
        retire_ages[id] = float(retire_ages.get(id, 0.0)) + delta
        if float(retire_ages[id]) < limit:
            continue
        retire_ages.erase(id)
        game.vehicles.erase(car)
        car.queue_free()
        retired_count += 1

func _maintain_traffic() -> void:
    if respawn_cooldown > 0.0 or traffic_routes.is_empty():
        return
    var live := get_live_traffic_count()
    if live >= traffic_floor:
        return
    if _spawn_replacement_traffic():
        respawn_cooldown = 2.4
    else:
        respawn_cooldown = 1.0

func _spawn_replacement_traffic() -> bool:
    var player_target: Node2D = game._player_target() if game.has_method("_player_target") else null
    for attempt in range(traffic_routes.size() * 2):
        var route := traffic_routes[(traffic_serial + attempt) % traffic_routes.size()]
        if route.size() < 2:
            continue
        var point_index := (traffic_serial * 3 + attempt) % route.size()
        var spawn := route[point_index]
        if is_instance_valid(player_target) and player_target.global_position.distance_to(spawn) < 650.0:
            continue
        var car = VEHICLE_SCRIPT.new()
        car.name = "Build16Traffic%03d" % traffic_serial
        var collision := CollisionShape2D.new()
        var shape := RectangleShape2D.new()
        shape.size = Vector2(34, 64)
        collision.shape = shape
        car.add_child(collision)
        game.add_child(car)
        car.add_to_group("vehicles")
        var colors := [
            Color(0.18, 0.52, 0.82), Color(0.88, 0.62, 0.17),
            Color(0.24, 0.68, 0.42), Color(0.72, 0.35, 0.70),
            Color(0.78, 0.78, 0.74), Color(0.30, 0.31, 0.34)
        ]
        car.configure_ai(route, point_index, colors[traffic_serial % colors.size()], 190.0 + float((traffic_serial % 4) * 17))
        car.set_meta("build16_base_cruise", float(car.get("ai_cruise_speed")))
        game.vehicles.append(car)
        traffic_serial += 1
        return true
    traffic_serial += 1
    return false

func get_live_traffic_count() -> int:
    if game == null:
        return 0
    var count := 0
    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value != null and bool(ai_value):
            if not car.has_method("is_destroyed") or not car.is_destroyed():
                count += 1
    return count

func get_live_pedestrian_count() -> int:
    if game == null:
        return 0
    var count := 0
    for ped in game.pedestrians:
        if is_instance_valid(ped):
            count += 1
    return count

func get_retired_count() -> int:
    return retired_count
