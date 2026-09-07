extends "res://scripts/world_manager_build18.gd"

const SIGNAL_CYCLE := 12.0
const SIGNAL_HORIZONTAL_END := 5.0
const SIGNAL_VERTICAL_START := 6.0
const SIGNAL_VERTICAL_END := 11.0

var signal_x: Array[float] = []
var signal_y: Array[float] = []

func _ready() -> void:
    super._ready()
    _load_signal_axes()

func _load_signal_axes() -> void:
    var city = game.get_node_or_null("City") if game != null else null
    if city != null:
        for value in city.get("road_x"):
            signal_x.append(float(value))
        for value in city.get("road_y"):
            signal_y.append(float(value))

func _pace_traffic() -> void:
    super._pace_traffic()
    var now := Time.get_ticks_msec() / 1000.0
    for car in game.vehicles:
        if not is_instance_valid(car):
            continue
        var ai_value = car.get("ai_enabled")
        if ai_value == null or not bool(ai_value):
            continue
        if car.has_method("is_destroyed") and car.is_destroyed():
            continue
        var signal_factor := _signal_factor(car, now)
        var current_cruise := float(car.get("ai_cruise_speed"))
        car.set("ai_cruise_speed", current_cruise * signal_factor)
        car.set_meta("build19_signal_brake", signal_factor < 0.72)

func _signal_factor(car: Node2D, now: float) -> float:
    var forward := Vector2.UP.rotated(car.rotation).normalized()
    var horizontal := abs(forward.x) >= abs(forward.y)
    var side := Vector2(-forward.y, forward.x)
    var nearest_long := INF
    var selected := Vector2.ZERO
    for x in signal_x:
        for y in signal_y:
            var point := Vector2(x, y)
            var offset := point - car.global_position
            var along := forward.dot(offset)
            if along < 26.0 or along > 155.0:
                continue
            if abs(side.dot(offset)) > 78.0:
                continue
            if along < nearest_long:
                nearest_long = along
                selected = point
    if is_inf(nearest_long):
        return 1.0
    var phase := fmod(now + _signal_offset(selected), SIGNAL_CYCLE)
    var green := phase < SIGNAL_HORIZONTAL_END if horizontal else (phase >= SIGNAL_VERTICAL_START and phase < SIGNAL_VERTICAL_END)
    if green:
        return 1.0
    if nearest_long < 58.0:
        return 0.06
    if nearest_long < 88.0:
        return 0.22
    if nearest_long < 120.0:
        return 0.48
    return 0.72

func _signal_offset(point: Vector2) -> float:
    return fmod(abs(point.x * 0.003 + point.y * 0.005), SIGNAL_CYCLE)

func get_signal_phase(point: Vector2) -> Dictionary:
    var now := Time.get_ticks_msec() / 1000.0
    var phase := fmod(now + _signal_offset(point), SIGNAL_CYCLE)
    return {
        "horizontal_green": phase < SIGNAL_HORIZONTAL_END,
        "vertical_green": phase >= SIGNAL_VERTICAL_START and phase < SIGNAL_VERTICAL_END
    }
