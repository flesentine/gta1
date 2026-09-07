extends "res://scripts/main.gd"

const PICKUP_BUILD27 = preload("res://scripts/pickup_build27.gd")
const SHOTGUN_RANGE27 := 330.0
const SHOTGUN_COOLDOWN27 := 0.72
const SHOTGUN_SPREAD27 := [-0.18, -0.11, -0.045, 0.045, 0.11, 0.18]

var shotgun_owned27 := false
var shotgun_ammo27 := 0
var current_weapon27 := "PISTOL"

func _spawn_pickups() -> void:
    super._spawn_pickups()
    _spawn_weapon_pickup27("shotgun", Vector2(-4100, 1180), 8)
    _spawn_weapon_pickup27("shells", Vector2(-5000, -650), 5)
    _spawn_weapon_pickup27("shells", Vector2(-3200, 1200), 5)

func _spawn_weapon_pickup27(kind: String, position_value: Vector2, amount_value: int) -> void:
    var pickup = PICKUP_BUILD27.new()
    pickup.configure(kind, position_value, amount_value)
    add_child(pickup)
    pickups.append(pickup)

func _check_pickups() -> void:
    if not in_vehicle:
        for pickup in pickups.duplicate():
            if not is_instance_valid(pickup):
                continue
            if str(pickup.pickup_kind) not in ["shotgun", "shells"]:
                continue
            if player.global_position.distance_to(pickup.global_position) > 31.0:
                continue
            if pickup.pickup_kind == "shotgun":
                shotgun_owned27 = true
                shotgun_ammo27 += int(pickup.amount)
                current_weapon27 = "SHOTGUN"
                status_message = "SHOTGUN ACQUIRED — %d SHELLS" % shotgun_ammo27
            else:
                shotgun_ammo27 += int(pickup.amount)
                status_message = "SHOTGUN SHELLS +%d" % int(pickup.amount)
            status_message_timer = 1.6
            pickups.erase(pickup)
            pickup.queue_free()
    super._check_pickups()

func _unhandled_input(event: InputEvent) -> void:
    if respawn_timer <= 0.0 and event is InputEventKey and event.pressed and not event.echo:
        var key := event as InputEventKey
        if key.keycode == KEY_Q:
            _toggle_weapon27()
            get_viewport().set_input_as_handled()
            return
    super._unhandled_input(event)

func _toggle_weapon27() -> void:
    if not shotgun_owned27:
        return
    if not pistol_owned:
        current_weapon27 = "SHOTGUN"
    else:
        current_weapon27 = "PISTOL" if current_weapon27 == "SHOTGUN" else "SHOTGUN"
    status_message = "WEAPON — %s" % current_weapon27
    status_message_timer = 1.0

func _shoot_pistol() -> void:
    if current_weapon27 == "SHOTGUN" and shotgun_owned27:
        _shoot_shotgun27()
        return
    super._shoot_pistol()

func _shoot_shotgun27() -> void:
    if in_vehicle or not shotgun_owned27 or shotgun_ammo27 <= 0 or shot_cooldown > 0.0:
        return
    shotgun_ammo27 -= 1
    shot_cooldown = SHOTGUN_COOLDOWN27
    var direction := player.get_facing().normalized()
    if direction.length_squared() < 0.001:
        direction = Vector2.UP
    var origin := player.global_position + direction * 24.0
    var base_angle := direction.angle()
    var hit_map: Dictionary = {}
    var hit_pedestrian := false

    for spread in SHOTGUN_SPREAD27:
        var pellet_direction := Vector2.RIGHT.rotated(base_angle + float(spread))
        var end := origin + pellet_direction * SHOTGUN_RANGE27
        var query := PhysicsRayQueryParameters2D.create(origin, end)
        query.exclude = [player.get_rid()]
        var result := get_world_2d().direct_space_state.intersect_ray(query)
        if not result.is_empty():
            end = result.position
            var collider = result.collider
            if collider != null and (collider.is_in_group("pedestrians") or collider.is_in_group("vehicles")):
                var id := collider.get_instance_id()
                var entry: Dictionary = hit_map.get(id, {"node": collider, "hits": 0})
                entry["hits"] = int(entry["hits"]) + 1
                hit_map[id] = entry
        tracers.append({"start": origin, "end": end, "time": 0.12})

    for entry in hit_map.values():
        var collider = entry["node"]
        if not is_instance_valid(collider):
            continue
        var hits := int(entry["hits"])
        if collider.is_in_group("pedestrians") and collider.has_method("take_damage"):
            collider.take_damage(hits)
            hit_pedestrian = true
        elif collider.is_in_group("vehicles") and collider.has_method("take_damage"):
            var was_destroyed := collider.is_destroyed() if collider.has_method("is_destroyed") else false
            collider.take_damage(mini(hits, 3))
            if collider.has_method("is_destroyed") and not was_destroyed and collider.is_destroyed():
                _raise_wanted(1)

    if hit_pedestrian:
        _raise_wanted(1)
    for ped in pedestrians:
        if is_instance_valid(ped) and ped.has_method("react_to_gunshot"):
            if ped.global_position.distance_to(origin) <= 440.0:
                ped.react_to_gunshot(origin)
    queue_redraw()

func grant_shotgun27(shells: int = 8) -> void:
    shotgun_owned27 = true
    shotgun_ammo27 = maxi(shotgun_ammo27, shells)
    current_weapon27 = "SHOTGUN"
    status_message = "SHOTGUN ACQUIRED — %d SHELLS" % shotgun_ammo27
    status_message_timer = 1.8

func get_weapon_text27() -> String:
    if current_weapon27 == "SHOTGUN" and shotgun_owned27:
        return "SHOTGUN %03d" % shotgun_ammo27
    if pistol_owned:
        return "PISTOL %03d" % pistol_ammo
    if shotgun_owned27:
        return "SHOTGUN %03d" % shotgun_ammo27
    return "UNARMED"

func _lose_life(reason: String) -> void:
    shotgun_owned27 = false
    shotgun_ammo27 = 0
    current_weapon27 = "PISTOL"
    super._lose_life(reason)

func _update_hud() -> void:
    super._update_hud()
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 6", "BUILD 27")
        if not in_vehicle:
            hud_label.text += "\nWEAPON %s%s" % [get_weapon_text27(), "   Q SWITCH" if shotgun_owned27 else ""]
    if help_label != null:
        help_label.text = "WASD / Arrows: move or drive   E: enter/exit   Space/F: fire   Q: switch weapon   M: map   Blue phone: missions   R: reset"
