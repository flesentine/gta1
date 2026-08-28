extends Node2D

const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")
const PEDESTRIAN_SCRIPT = preload("res://scripts/pedestrian.gd")
const PICKUP_SCRIPT = preload("res://scripts/pickup.gd")
const POLICE_SCRIPT = preload("res://scripts/police_car.gd")

@onready var player: CharacterBody2D = $Player
@onready var starter_car: CharacterBody2D = $Car
@onready var camera: Camera2D = $Camera2D
@onready var hud_label: Label = $HUD/Panel/Label
@onready var help_label: Label = $HUD/Help

var vehicles: Array[CharacterBody2D] = []
var pedestrians: Array[CharacterBody2D] = []
var pickups: Array[Node2D] = []
var police: Array[CharacterBody2D] = []
var current_vehicle: CharacterBody2D = null
var in_vehicle := false

var pistol_owned := false
var pistol_ammo := 0
var shot_cooldown := 0.0
var tracers: Array[Dictionary] = []

var wanted_level := 0
var wanted_decay_timer := 0.0
var police_spawn_cooldown := 0.0
var stolen_vehicle_ids := {}

var traffic_routes := [
    PackedVector2Array([
        Vector2(-900, -650), Vector2(0, -650), Vector2(900, -650),
        Vector2(900, 0), Vector2(900, 650), Vector2(0, 650),
        Vector2(-900, 650), Vector2(-900, 0)
    ]),
    PackedVector2Array([
        Vector2(-900, 0), Vector2(0, 0), Vector2(0, 650),
        Vector2(900, 650), Vector2(900, 0), Vector2(0, 0),
        Vector2(0, -650), Vector2(-900, -650)
    ]),
    PackedVector2Array([
        Vector2(0, -650), Vector2(900, -650), Vector2(900, 0),
        Vector2(0, 0), Vector2(-900, 0), Vector2(-900, 650),
        Vector2(0, 650), Vector2(0, 0)
    ])
]

var traffic_colors := [
    Color(0.16, 0.48, 0.82), Color(0.91, 0.67, 0.16),
    Color(0.20, 0.70, 0.42), Color(0.72, 0.28, 0.72),
    Color(0.86, 0.86, 0.82), Color(0.18, 0.18, 0.20),
    Color(0.82, 0.32, 0.20), Color(0.34, 0.70, 0.75)
]

var pedestrian_colors := [
    Color(0.20, 0.48, 0.82), Color(0.84, 0.29, 0.25),
    Color(0.18, 0.64, 0.38), Color(0.72, 0.42, 0.74),
    Color(0.88, 0.61, 0.19), Color(0.32, 0.32, 0.36),
    Color(0.74, 0.70, 0.58), Color(0.18, 0.64, 0.68)
]

func _ready() -> void:
    camera.make_current()

    starter_car.set_body_color(Color(0.78, 0.16, 0.13))
    starter_car.set_parked()
    starter_car.add_to_group("vehicles")
    vehicles.append(starter_car)
    stolen_vehicle_ids[starter_car.get_instance_id()] = true

    _spawn_traffic()
    _spawn_pedestrians()
    _spawn_pickups()
    _update_hud()

func _spawn_traffic() -> void:
    var spawn_plan := [
        [0, 0], [0, 2], [0, 4], [0, 6],
        [1, 1], [1, 3], [1, 5],
        [2, 0], [2, 3], [2, 6]
    ]

    for i in range(spawn_plan.size()):
        var route_index: int = spawn_plan[i][0]
        var point_index: int = spawn_plan[i][1]
        var car = VEHICLE_SCRIPT.new()
        car.name = "TrafficCar%02d" % i

        var collision := CollisionShape2D.new()
        var shape := RectangleShape2D.new()
        shape.size = Vector2(34, 64)
        collision.shape = shape
        car.add_child(collision)

        add_child(car)
        car.add_to_group("vehicles")
        car.configure_ai(
            traffic_routes[route_index],
            point_index,
            traffic_colors[i % traffic_colors.size()],
            185.0 + float((i % 4) * 18)
        )
        vehicles.append(car)

func _spawn_pedestrians() -> void:
    var routes := _sidewalk_routes()
    for i in range(28):
        var route: PackedVector2Array = routes[i % routes.size()]
        var ped = PEDESTRIAN_SCRIPT.new()
        ped.name = "Pedestrian%02d" % i
        ped.walk_speed = 52.0 + float((i % 5) * 5)

        var collision := CollisionShape2D.new()
        var shape := CircleShape2D.new()
        shape.radius = 8.5
        collision.shape = shape
        ped.add_child(collision)

        add_child(ped)
        ped.configure(route, i % route.size(), pedestrian_colors[i % pedestrian_colors.size()])
        pedestrians.append(ped)

func _spawn_pickups() -> void:
    var pickup_plan := [
        ["pistol", Vector2(125, 82), 12],
        ["ammo", Vector2(-75, 82), 10],
        ["ammo", Vector2(82, -120), 10],
        ["ammo", Vector2(-900, -520), 10],
        ["ammo", Vector2(900, 520), 10],
        ["ammo", Vector2(900, -520), 10],
        ["ammo", Vector2(-900, 520), 10]
    ]

    for item in pickup_plan:
        var pickup = PICKUP_SCRIPT.new()
        pickup.configure(str(item[0]), item[1], int(item[2]))
        add_child(pickup)
        pickups.append(pickup)

func _sidewalk_routes() -> Array[PackedVector2Array]:
    var routes: Array[PackedVector2Array] = []
    var x_spans := [
        Vector2(-1540, -1040), Vector2(-760, -140),
        Vector2(140, 760), Vector2(1040, 1540)
    ]
    var y_spans := [
        Vector2(-1140, -790), Vector2(-510, -140),
        Vector2(140, 510), Vector2(790, 1140)
    ]
    var margin := 38.0
    for xs in x_spans:
        for ys in y_spans:
            routes.append(PackedVector2Array([
                Vector2(xs.x - margin, ys.x - margin),
                Vector2(xs.y + margin, ys.x - margin),
                Vector2(xs.y + margin, ys.y + margin),
                Vector2(xs.x - margin, ys.y + margin)
            ]))
    return routes

func _process(delta: float) -> void:
    shot_cooldown = max(shot_cooldown - delta, 0.0)
    police_spawn_cooldown = max(police_spawn_cooldown - delta, 0.0)
    _update_tracers(delta)
    _check_pickups()

    if in_vehicle and is_instance_valid(current_vehicle):
        if current_vehicle.has_method("is_destroyed") and current_vehicle.is_destroyed():
            _exit_vehicle()

    _update_wanted(delta)
    _update_police()

    var target: Node2D = _player_target()
    var follow_weight := 1.0 - exp(-8.0 * delta)
    camera.global_position = camera.global_position.lerp(target.global_position, follow_weight)

    var speed_ratio := 0.0
    if in_vehicle and is_instance_valid(current_vehicle):
        speed_ratio = clamp(current_vehicle.get_speed_ratio(), 0.0, 1.0)
    var target_zoom := Vector2.ONE.lerp(Vector2(0.62, 0.62), speed_ratio)
    camera.zoom = camera.zoom.lerp(target_zoom, 1.0 - exp(-4.0 * delta))

    _update_hud()
    if not tracers.is_empty():
        queue_redraw()

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and not event.echo:
        if event.keycode == KEY_E:
            _toggle_vehicle()
            get_viewport().set_input_as_handled()
        elif event.keycode == KEY_SPACE or event.keycode == KEY_F:
            _shoot_pistol()
            get_viewport().set_input_as_handled()
        elif event.keycode == KEY_R:
            get_tree().reload_current_scene()
            get_viewport().set_input_as_handled()

func _player_target() -> Node2D:
    if in_vehicle and is_instance_valid(current_vehicle):
        return current_vehicle
    return player

func _toggle_vehicle() -> void:
    if in_vehicle:
        _exit_vehicle()
        return

    var nearest := _nearest_vehicle()
    if nearest != null and player.global_position.distance_to(nearest.global_position) <= 92.0:
        _enter_vehicle(nearest)

func _nearest_vehicle() -> CharacterBody2D:
    var nearest: CharacterBody2D = null
    var best_distance := INF
    for car in vehicles:
        if not is_instance_valid(car):
            continue
        if car.has_method("is_destroyed") and car.is_destroyed():
            continue
        var distance := player.global_position.distance_to(car.global_position)
        if distance < best_distance:
            best_distance = distance
            nearest = car
    return nearest

func _enter_vehicle(car: CharacterBody2D) -> void:
    var id := car.get_instance_id()
    if not stolen_vehicle_ids.has(id):
        stolen_vehicle_ids[id] = true
        _raise_wanted(1)

    current_vehicle = car
    in_vehicle = true
    player.set_active(false)
    player.visible = false
    current_vehicle.set_controlled(true)

func _exit_vehicle() -> void:
    if not is_instance_valid(current_vehicle):
        in_vehicle = false
        player.visible = true
        player.set_active(true)
        current_vehicle = null
        return

    var side := Vector2.RIGHT.rotated(current_vehicle.rotation) * 52.0
    player.global_position = current_vehicle.global_position + side
    player.visible = true
    player.set_active(true)
    current_vehicle.set_controlled(false)
    current_vehicle.set_parked()
    current_vehicle = null
    in_vehicle = false

func _check_pickups() -> void:
    if in_vehicle:
        return

    for pickup in pickups.duplicate():
        if not is_instance_valid(pickup):
            pickups.erase(pickup)
            continue
        if player.global_position.distance_to(pickup.global_position) > 31.0:
            continue

        if pickup.pickup_kind == "pistol":
            pistol_owned = true
            pistol_ammo += pickup.amount
        elif pickup.pickup_kind == "ammo":
            pistol_ammo += pickup.amount

        pickups.erase(pickup)
        pickup.queue_free()

func _shoot_pistol() -> void:
    if in_vehicle or not pistol_owned or pistol_ammo <= 0 or shot_cooldown > 0.0:
        return

    pistol_ammo -= 1
    shot_cooldown = 0.24

    var direction := player.get_facing().normalized()
    var origin := player.global_position + direction * 24.0
    var end := origin + direction * 560.0

    var query := PhysicsRayQueryParameters2D.create(origin, end)
    query.exclude = [player.get_rid()]
    var result := get_world_2d().direct_space_state.intersect_ray(query)

    if not result.is_empty():
        end = result.position
        var collider = result.collider
        if collider != null:
            if collider.is_in_group("pedestrians") and collider.has_method("take_damage"):
                collider.take_damage(2)
                _raise_wanted(1)
            elif collider.is_in_group("vehicles") and collider.has_method("take_damage"):
                var was_destroyed := collider.is_destroyed() if collider.has_method("is_destroyed") else false
                collider.take_damage(1)
                if collider.has_method("is_destroyed") and not was_destroyed and collider.is_destroyed():
                    _raise_wanted(1)

    for ped in pedestrians:
        if is_instance_valid(ped) and ped.has_method("react_to_gunshot"):
            if ped.global_position.distance_to(origin) <= 360.0:
                ped.react_to_gunshot(origin)

    tracers.append({"start": origin, "end": end, "time": 0.09})
    queue_redraw()

func _raise_wanted(amount: int) -> void:
    wanted_level = clamp(wanted_level + amount, 0, 4)
    wanted_decay_timer = 13.0 + float(wanted_level) * 2.0
    police_spawn_cooldown = min(police_spawn_cooldown, 0.3)

func _update_wanted(delta: float) -> void:
    if wanted_level <= 0:
        wanted_decay_timer = 0.0
        return

    var target := _player_target()
    var nearest_police := INF
    for cop in police:
        if is_instance_valid(cop):
            nearest_police = min(nearest_police, target.global_position.distance_to(cop.global_position))

    if nearest_police <= 620.0:
        wanted_decay_timer = max(wanted_decay_timer, 5.0)
    else:
        wanted_decay_timer -= delta
        if wanted_decay_timer <= 0.0:
            wanted_level = max(wanted_level - 1, 0)
            wanted_decay_timer = 8.0 if wanted_level > 0 else 0.0

func _update_police() -> void:
    for i in range(police.size() - 1, -1, -1):
        var cop = police[i]
        if not is_instance_valid(cop):
            police.remove_at(i)
            continue
        cop.set_target(_player_target())
        if wanted_level <= 0:
            cop.queue_free()
            police.remove_at(i)

    if wanted_level <= 0 or police_spawn_cooldown > 0.0:
        return

    var desired_count := wanted_level
    if wanted_level >= 3:
        desired_count += 1
    desired_count = min(desired_count, 5)

    if police.size() < desired_count:
        _spawn_police_car(police.size())
        police_spawn_cooldown = max(0.7, 2.0 - float(wanted_level) * 0.25)

func _spawn_police_car(seed: int) -> void:
    var target := _player_target()
    var offsets := [
        Vector2(0, -620), Vector2(620, 0), Vector2(0, 620), Vector2(-620, 0),
        Vector2(430, -430), Vector2(-430, 430)
    ]
    var spawn_position := target.global_position + offsets[(seed + wanted_level) % offsets.size()]
    spawn_position.x = clamp(spawn_position.x, -1500.0, 1500.0)
    spawn_position.y = clamp(spawn_position.y, -1100.0, 1100.0)

    var cop = POLICE_SCRIPT.new()
    cop.name = "PoliceCar%02d" % (police.size() + 1)
    var collision := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = Vector2(36, 66)
    collision.shape = shape
    cop.add_child(collision)
    add_child(cop)
    cop.configure(spawn_position, target, wanted_level)
    police.append(cop)

func _update_tracers(delta: float) -> void:
    for i in range(tracers.size() - 1, -1, -1):
        tracers[i]["time"] = float(tracers[i]["time"]) - delta
        if float(tracers[i]["time"]) <= 0.0:
            tracers.remove_at(i)

func _draw() -> void:
    for tracer in tracers:
        draw_line(tracer["start"], tracer["end"], Color(1.0, 0.88, 0.30, 0.92), 3.0, true)
        draw_circle(tracer["end"], 4.0, Color(1.0, 0.55, 0.16, 0.9))

func _wanted_text() -> String:
    var text := ""
    for i in range(4):
        text += "●" if i < wanted_level else "○"
    return text

func _update_hud() -> void:
    var mode := "DRIVING" if in_vehicle else "ON FOOT"
    var extra := ""

    if not in_vehicle:
        var nearest := _nearest_vehicle()
        if nearest != null:
            var distance := player.global_position.distance_to(nearest.global_position)
            if distance <= 92.0:
                extra = "\nE — STEAL VEHICLE"
    elif is_instance_valid(current_vehicle):
        extra = "\nSPEED  %03d" % int(current_vehicle.get_forward_speed_abs())

    var down_count := 0
    for ped in pedestrians:
        if is_instance_valid(ped) and ped.has_method("is_down") and ped.is_down():
            down_count += 1

    var weapon_text := "PISTOL --"
    if pistol_owned:
        weapon_text = "PISTOL %03d" % pistol_ammo

    hud_label.text = "GTA1 REMAKE — BUILD 5\n%s%s\n%s   WANTED %s\nTRAFFIC %02d   PEDS %02d   POLICE %02d" % [
        mode, extra, weapon_text, _wanted_text(), max(vehicles.size() - 1, 0),
        max(pedestrians.size() - down_count, 0), police.size()
    ]
    help_label.text = "WASD / Arrows: move or drive   E: enter/exit   Space/F: fire   R: reset"
