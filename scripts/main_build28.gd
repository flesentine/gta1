extends "res://scripts/main_build27.gd"

const PICKUP_BUILD28 = preload("res://scripts/pickup_build28.gd")
const SMG_RANGE28 := 520.0
const SMG_COOLDOWN28 := 0.22
const SMG_SPREAD28 := [-0.035, 0.0, 0.035]

var smg_owned28 := false
var smg_ammo28 := 0

func _spawn_pickups() -> void:
    super._spawn_pickups()
    _spawn_weapon_pickup28("smg", Vector2(4100, -1180), 45)
    _spawn_weapon_pickup28("smg_ammo", Vector2(5000, -650), 30)
    _spawn_weapon_pickup28("smg_ammo", Vector2(3200, 650), 30)

func _spawn_weapon_pickup28(kind: String, position_value: Vector2, amount_value: int) -> void:
    var pickup = PICKUP_BUILD28.new()
    pickup.configure(kind, position_value, amount_value)
    add_child(pickup)
    pickups.append(pickup)

func _check_pickups() -> void:
    if not in_vehicle:
        for pickup in pickups.duplicate():
            if not is_instance_valid(pickup):
                continue
            if str(pickup.pickup_kind) not in ["smg", "smg_ammo"]:
                continue
            if player.global_position.distance_to(pickup.global_position) > 31.0:
                continue
            if pickup.pickup_kind == "smg":
                smg_owned28 = true
                smg_ammo28 += int(pickup.amount)
                current_weapon27 = "SMG"
                status_message = "SMG ACQUIRED — %d ROUNDS" % smg_ammo28
            else:
                smg_ammo28 += int(pickup.amount)
                status_message = "SMG AMMO +%d" % int(pickup.amount)
            status_message_timer = 1.6
            pickups.erase(pickup)
            pickup.queue_free()
    super._check_pickups()

func _toggle_weapon27() -> void:
    var owned: Array[String] = []
    if pistol_owned:
        owned.append("PISTOL")
    if shotgun_owned27:
        owned.append("SHOTGUN")
    if smg_owned28:
        owned.append("SMG")
    if owned.is_empty():
        return
    var index := owned.find(current_weapon27)
    if index < 0:
        index = 0
    else:
        index = (index + 1) % owned.size()
    current_weapon27 = owned[index]
    status_message = "WEAPON — %s" % current_weapon27
    status_message_timer = 1.0

func _shoot_pistol() -> void:
    if current_weapon27 == "SMG" and smg_owned28:
        _shoot_smg28()
        return
    super._shoot_pistol()

func _shoot_smg28() -> void:
    if in_vehicle or not smg_owned28 or smg_ammo28 <= 0 or shot_cooldown > 0.0:
        return
    var rounds := mini(3, smg_ammo28)
    smg_ammo28 -= rounds
    shot_cooldown = SMG_COOLDOWN28
    var direction := player.get_facing().normalized()
    if direction.length_squared() < 0.001:
        direction = Vector2.UP
    var origin := player.global_position + direction * 24.0
    var base_angle := direction.angle()
    var hit_map: Dictionary = {}
    var hit_pedestrian := false

    for i in range(rounds):
        var bullet_direction := Vector2.RIGHT.rotated(base_angle + float(SMG_SPREAD28[i]))
        var end := origin + bullet_direction * SMG_RANGE28
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
        tracers.append({"start": origin, "end": end, "time": 0.08})

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
            collider.take_damage(1)
            if collider.has_method("is_destroyed") and not was_destroyed and collider.is_destroyed():
                _raise_wanted(1)

    if hit_pedestrian:
        _raise_wanted(1)
    for ped in pedestrians:
        if is_instance_valid(ped) and ped.has_method("react_to_gunshot"):
            if ped.global_position.distance_to(origin) <= 520.0:
                ped.react_to_gunshot(origin)
    queue_redraw()

func grant_smg28(ammo: int = 45) -> void:
    smg_owned28 = true
    smg_ammo28 = maxi(smg_ammo28, ammo)
    current_weapon27 = "SMG"
    status_message = "SMG ACQUIRED — %d ROUNDS" % smg_ammo28
    status_message_timer = 1.8

func get_weapon_text27() -> String:
    if current_weapon27 == "SMG" and smg_owned28:
        return "SMG %03d" % smg_ammo28
    return super.get_weapon_text27()

func _lose_life(reason: String) -> void:
    smg_owned28 = false
    smg_ammo28 = 0
    super._lose_life(reason)

func _update_hud() -> void:
    super._update_hud()
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 27", "BUILD 28")
    if help_label != null:
        help_label.text = "WASD / Arrows: move or drive   E: enter/exit   Space/F: fire   Q: cycle weapon   M: map   Blue phone: missions   R: reset"
