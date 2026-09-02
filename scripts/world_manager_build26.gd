extends "res://scripts/world_manager_build25.gd"

const SPIKE_LIFETIME26 := 9.0
const SPIKE_COOLDOWN26 := 8.0
const SPIKE_MIN_DISTANCE26 := 280.0
const SPIKE_MAX_DISTANCE26 := 1150.0
const WORLD26 := Rect2(-5400.0, -1700.0, 10800.0, 3400.0)

var spike_strips26: Array[Dictionary] = []
var spike_cooldown26 := 4.0
var spike_serial26 := 0

func _process(delta: float) -> void:
    super._process(delta)
    _update_spike_strips26(delta)
    _update_tire_wobble26(delta)

func _route_police_around_blocks() -> void:
    if game == null or game.police.is_empty():
        return
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return
    var intercept := _predict_target_position(target)
    var motion := _target_motion24(target)
    if int(game.wanted_level) < 4:
        var normal_side := Vector2(-motion.y, motion.x)
        for i in range(game.police.size()):
            var cop = game.police[i]
            if not is_instance_valid(cop) or not cop.has_method("set_pursuit_path"):
                continue
            var role := i % 3
            var aim := intercept
            if role == 1:
                aim += normal_side * 520.0
                cop.set_meta("build24_role", "FLANK A")
            elif role == 2:
                aim -= normal_side * 520.0
                cop.set_meta("build24_role", "FLANK B")
            else:
                cop.set_meta("build24_role", "CHASE")
            aim.x = clamp(aim.x, WORLD26.position.x + 60.0, WORLD26.end.x - 60.0)
            aim.y = clamp(aim.y, WORLD26.position.y + 60.0, WORLD26.end.y - 60.0)
            if int(game.wanted_level) >= 3 and cop.global_position.distance_to(target.global_position) < 210.0:
                cop.set_pursuit_path(PackedVector2Array())
            else:
                cop.set_pursuit_path(_route_to_point24(cop, aim, target))
        return

    if motion.length_squared() < 0.001:
        motion = Vector2.RIGHT
    motion = motion.normalized()
    var side := Vector2(-motion.y, motion.x)
    var target_speed := 0.0
    if target is CharacterBody2D:
        target_speed = (target as CharacterBody2D).velocity.length()
    var ring := 135.0 if target_speed < 170.0 else 235.0
    var aims := [
        {"point": intercept + motion * ring, "role": "BOX FRONT"},
        {"point": target.global_position + side * ring, "role": "BOX LEFT"},
        {"point": target.global_position - side * ring, "role": "BOX RIGHT"},
        {"point": target.global_position - motion * ring * 0.85, "role": "BOX REAR"}
    ]

    for i in range(game.police.size()):
        var cop = game.police[i]
        if not is_instance_valid(cop) or not cop.has_method("set_pursuit_path"):
            continue
        var plan: Dictionary = aims[i % aims.size()]
        var aim: Vector2 = plan["point"]
        aim.x = clamp(aim.x, WORLD26.position.x + 60.0, WORLD26.end.x - 60.0)
        aim.y = clamp(aim.y, WORLD26.position.y + 60.0, WORLD26.end.y - 60.0)
        cop.set_meta("build24_role", str(plan["role"]))
        cop.set_meta("build26_box_role", str(plan["role"]))
        cop.set_pursuit_path(_route_to_point24(cop, aim, target))

func _update_spike_strips26(delta: float) -> void:
    if game == null:
        return
    spike_cooldown26 = max(spike_cooldown26 - delta, 0.0)
    var now := Time.get_ticks_msec() / 1000.0
    var changed := false
    for i in range(spike_strips26.size() - 1, -1, -1):
        var strip: Dictionary = spike_strips26[i]
        if float(strip.get("until", 0.0)) <= now or int(game.wanted_level) < 4:
            spike_strips26.remove_at(i)
            changed = true

    if int(game.wanted_level) >= 4 and spike_strips26.is_empty() and spike_cooldown26 <= 0.0:
        changed = _spawn_spike_strip26() or changed

    if bool(game.in_vehicle) and is_instance_valid(game.current_vehicle):
        var car = game.current_vehicle
        var hit_until := float(car.get_meta("build26_spike_hit_until", 0.0))
        if now >= hit_until:
            for strip in spike_strips26:
                var rect: Rect2 = strip.get("rect", Rect2())
                if rect.has_point(car.global_position):
                    var amount := 2 if car.get_forward_speed_abs() > 220.0 else 1
                    _damage_tires26(car, amount)
                    car.set_meta("build26_spike_hit_until", now + 0.9)
                    strip["until"] = now + 0.45
                    changed = true
                    break

    if changed or not spike_strips26.is_empty():
        var city = game.get_node_or_null("City")
        if city != null:
            city.queue_redraw()

func _spawn_spike_strip26() -> bool:
    var target: Node2D = game._player_target() if game.has_method("_player_target") else null
    if not is_instance_valid(target):
        return false
    var motion := _target_motion24(target)
    var predicted := _predict_target_position(target)
    var horizontal := abs(motion.x) >= abs(motion.y)
    var point := Vector2.ZERO
    if horizontal:
        point.x = _axis_ahead24(predicted.x, signal_x, 1 if motion.x >= 0.0 else -1)
        point.y = _nearest_axis(target.global_position.y, signal_y)
    else:
        point.x = _nearest_axis(target.global_position.x, signal_x)
        point.y = _axis_ahead24(predicted.y, signal_y, 1 if motion.y >= 0.0 else -1)
    var distance := target.global_position.distance_to(point)
    if distance < SPIKE_MIN_DISTANCE26 or distance > SPIKE_MAX_DISTANCE26:
        spike_cooldown26 = 1.5
        return false
    for roadblock in roadblock_vehicles:
        if is_instance_valid(roadblock) and roadblock.global_position.distance_to(point) < 220.0:
            spike_cooldown26 = 1.5
            return false

    var size := Vector2(26.0, 192.0) if horizontal else Vector2(192.0, 26.0)
    spike_serial26 += 1
    spike_strips26 = [{
        "id": spike_serial26,
        "rect": Rect2(point - size * 0.5, size),
        "horizontal_motion": horizontal,
        "until": Time.get_ticks_msec() / 1000.0 + SPIKE_LIFETIME26
    }]
    spike_cooldown26 = SPIKE_COOLDOWN26
    game.status_message = "LEVEL 4 — SPIKE STRIP DEPLOYED"
    game.status_timer = 2.0
    return true

func _ensure_tire_state26(car: Node) -> void:
    if car.has_meta("build26_tire_base"):
        return
    car.set_meta("build26_tire_base", {
        "max": float(car.get("max_forward_speed")),
        "turn": float(car.get("turn_rate")),
        "accel": float(car.get("acceleration")),
        "brake": float(car.get("braking"))
    })
    car.set_meta("build26_tire_damage", 0)

func _damage_tires26(car: Node, amount: int) -> void:
    _ensure_tire_state26(car)
    var before := int(car.get_meta("build26_tire_damage", 0))
    var damage := clampi(before + amount, 0, 4)
    car.set_meta("build26_tire_damage", damage)
    _apply_tire_penalty26(car)
    if damage > before:
        car.set("skid_strength", max(float(car.get("skid_strength")), 0.9))
        if car.has_method("queue_redraw"):
            car.queue_redraw()
        game.status_message = "SPIKE STRIP — TIRE DAMAGE %d/4" % damage
        game.status_timer = 2.0

func _apply_tire_penalty26(car: Node) -> void:
    _ensure_tire_state26(car)
    var base: Dictionary = car.get_meta("build26_tire_base")
    var damage := clampi(int(car.get_meta("build26_tire_damage", 0)), 0, 4)
    var speed_factor := [1.0, 0.92, 0.80, 0.68, 0.56][damage]
    var turn_factor := [1.0, 0.93, 0.84, 0.74, 0.64][damage]
    var accel_factor := [1.0, 0.96, 0.89, 0.82, 0.74][damage]
    var brake_factor := [1.0, 0.98, 0.94, 0.88, 0.82][damage]
    car.set("max_forward_speed", float(base["max"]) * speed_factor)
    car.set("turn_rate", float(base["turn"]) * turn_factor)
    car.set("acceleration", float(base["accel"]) * accel_factor)
    car.set("braking", float(base["brake"]) * brake_factor)

func _update_tire_wobble26(delta: float) -> void:
    if game == null or not bool(game.in_vehicle) or not is_instance_valid(game.current_vehicle):
        return
    var car = game.current_vehicle
    var damage := int(car.get_meta("build26_tire_damage", 0))
    if damage <= 0:
        return
    _apply_tire_penalty26(car)
    if damage < 2 or car.get_forward_speed_abs() < 90.0:
        return
    var phase := Time.get_ticks_msec() / 72.0 + float(damage)
    var speed_ratio := clamp(car.get_forward_speed_abs() / 260.0, 0.0, 1.0)
    car.rotation += sin(phase) * (0.18 + float(damage) * 0.06) * delta * speed_ratio

func get_spike_strip_rects26() -> Array[Rect2]:
    var result: Array[Rect2] = []
    for strip in spike_strips26:
        var rect = strip.get("rect", Rect2())
        if rect is Rect2:
            result.append(rect)
    return result

func get_current_tire_damage26() -> int:
    if game == null or not bool(game.in_vehicle) or not is_instance_valid(game.current_vehicle):
        return 0
    return int(game.current_vehicle.get_meta("build26_tire_damage", 0))

func get_box_mode26() -> bool:
    return game != null and int(game.wanted_level) >= 4
