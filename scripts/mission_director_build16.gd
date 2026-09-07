extends "res://scripts/mission_director_build15.gd"

func _refresh_hud() -> void:
    super._refresh_hud()
    if game != null and game.hud_label != null:
        game.hud_label.text = game.hud_label.text.replace("BUILD 15", "BUILD 16")
    if hud_label != null:
        hud_label.text = hud_label.text.replace("BUILD 15", "BUILD 16")
