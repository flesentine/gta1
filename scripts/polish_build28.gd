extends "res://scripts/polish_build27.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label == null:
        return
    drive_label.text = drive_label.text.replace("BUILD 27", "BUILD 28")
    var game = get_tree().current_scene
    if game != null and not bool(game.in_vehicle) and game.has_method("get_weapon_text27"):
        var weapon := str(game.get_weapon_text27())
        if not drive_label.text.contains(weapon):
            drive_label.text += "   %s" % weapon
        var has_alt := bool(game.get("shotgun_owned27")) or bool(game.get("smg_owned28"))
        if has_alt and not drive_label.text.contains("Q SWITCH"):
            drive_label.text += "   Q SWITCH"
