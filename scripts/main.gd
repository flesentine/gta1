extends Node2D

const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")

@onready var player: CharacterBody2D = $Player
@onready var starter_car: CharacterBody2D = $Car
@onready var camera: Camera2D = $Camera2D
@onready var hud_label: Label = $HUD/Panel/Label
@onready var help_label: Label = $HUD/Help

var vehicles: Array[CharacterBody2D] = []
var current_vehicle: CharacterBody2D = null
var in_vehicle := false

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
    Color(0.16, 0.48, 0.82),
    Color(0.91, 0.67, 0.16),
    Color(0.20, 0.70, 0.42),
    Color(0.72, 0.28, 0.72),
    Color(0.86, 0.86, 0.82),
    Color(0.18, 0.18, 0.20),
    Color(0.82, 0.32, 0.20),
    Color(0.34, 0.70, 0.75)
]

func _ready() -> void:
    camera.make_current()

    starter_car.set_body_color(Color(0.78, 0.16, 0.13))
    starter_car.set_parked()
    vehicles.append(starter_car)

    _spawn_traffic()
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
        car.configure_ai(
            traffic_routes[route_index],
            point_index,
            traffic_colors[i % traffic_colors.size()],
            185.0 + float((i % 4) * 18)
        )
        vehicles.append(car)

func _process(delta: float) -> void:
    var target: Node2D = current_vehicle if in_vehicle and is_instance_valid(current_vehicle) else player
    var follow_weight := 1.0 - exp(-8.0 * delta)
    camera.global_position = camera.global_position.lerp(target.global_position, follow_weight)

    var speed_ratio := 0.0
    if in_vehicle and is_instance_valid(current_vehicle):
        speed_ratio = clamp(current_vehicle.get_speed_ratio(), 0.0, 1.0)
    var target_zoom := Vector2.ONE.lerp(Vector2(0.62, 0.62), speed_ratio)
    camera.zoom = camera.zoom.lerp(target_zoom, 1.0 - exp(-4.0 * delta))

    _update_hud()

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and not event.echo:
        if event.keycode == KEY_E:
            _toggle_vehicle()
            get_viewport().set_input_as_handled()
        elif event.keycode == KEY_R:
            get_tree().reload_current_scene()
            get_viewport().set_input_as_handled()

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
        var distance := player.global_position.distance_to(car.global_position)
        if distance < best_distance:
            best_distance = distance
            nearest = car
    return nearest

func _enter_vehicle(car: CharacterBody2D) -> void:
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
        return

    var side := Vector2.RIGHT.rotated(current_vehicle.rotation) * 52.0
    player.global_position = current_vehicle.global_position + side
    player.visible = true
    player.set_active(true)
    current_vehicle.set_controlled(false)
    current_vehicle.set_parked()
    current_vehicle = null
    in_vehicle = false

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

    hud_label.text = "GTA1 REMAKE — BUILD 2\n%s%s\nTRAFFIC  %02d" % [mode, extra, max(vehicles.size() - 1, 0)]
    help_label.text = "WASD / Arrows: move or drive   E: enter/exit   R: reset"
