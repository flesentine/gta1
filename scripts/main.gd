extends Node2D

@onready var player: CharacterBody2D = $Player
@onready var car: CharacterBody2D = $Car
@onready var camera: Camera2D = $Camera2D
@onready var hud_label: Label = $HUD/Panel/Label

var in_vehicle := false

func _ready() -> void:
    camera.make_current()
    _update_hud()

func _process(delta: float) -> void:
    var target: Node2D = car if in_vehicle else player
    var follow_weight := 1.0 - exp(-8.0 * delta)
    camera.global_position = camera.global_position.lerp(target.global_position, follow_weight)

    var speed_ratio := 0.0
    if in_vehicle:
        speed_ratio = clamp(car.get_speed_ratio(), 0.0, 1.0)
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

    if player.global_position.distance_to(car.global_position) <= 92.0:
        _enter_vehicle()

func _enter_vehicle() -> void:
    in_vehicle = true
    player.set_active(false)
    player.visible = false
    car.set_controlled(true)

func _exit_vehicle() -> void:
    var side := Vector2.RIGHT.rotated(car.rotation) * 52.0
    player.global_position = car.global_position + side
    player.visible = true
    player.set_active(true)
    car.set_controlled(false)
    in_vehicle = false

func _update_hud() -> void:
    var mode := "DRIVING" if in_vehicle else "ON FOOT"
    var extra := ""
    if not in_vehicle:
        var distance := player.global_position.distance_to(car.global_position)
        if distance <= 92.0:
            extra = "\nE — ENTER VEHICLE"
    else:
        extra = "\nSPEED  %03d" % int(car.get_forward_speed_abs())
    hud_label.text = "GTA1 REMAKE PROTOTYPE\n%s%s" % [mode, extra]
