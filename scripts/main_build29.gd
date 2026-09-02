extends "res://scripts/main_build28.gd"

var combat_armor29 := 4
var hostile_hit_lock29 := 0.0

func _process(delta: float) -> void:
    hostile_hit_lock29 = maxf(hostile_hit_lock29 - delta, 0.0)
    super._process(delta)

func take_hostile_hit29(amount: int = 1) -> void:
    if respawn_timer > 0.0 or hostile_hit_lock29 > 0.0:
        return
    hostile_hit_lock29 = 0.24
    combat_armor29 = maxi(combat_armor29 - maxi(amount, 0), 0)
    status_message = "UNDER FIRE — ARMOR %d" % combat_armor29
    status_message_timer = 0.9
    if combat_armor29 <= 0:
        combat_armor29 = 4
        _lose_life("WASTED")

func grant_combat_armor29(value: int = 4) -> void:
    combat_armor29 = maxi(value, 1)
    status_message = "COMBAT ARMOR %d" % combat_armor29
    status_message_timer = 1.2

func get_combat_armor29() -> int:
    return combat_armor29

func _lose_life(reason: String) -> void:
    combat_armor29 = 4
    super._lose_life(reason)

func _update_hud() -> void:
    super._update_hud()
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 28", "BUILD 29")
        if not in_vehicle:
            hud_label.text += "\nARMOR %d" % combat_armor29
    if help_label != null:
        help_label.text = "WASD / Arrows: move or drive   E: enter/exit   Space/F: fire   Q: cycle weapon   M: map   Blue phone: missions/chapter   R: reset"
