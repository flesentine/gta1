extends "res://scripts/polish_build26.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label == null:
        return
    drive_label.text = drive_label.text.replace("BUILD 26", "BUILD 27")
    var game = get_tree().current_scene
    if game != null and not bool(game.in_vehicle) and game.has_method("get_weapon_text27"):
        var weapon := str(game.get_weapon_text27())
        if not drive_label.text.contains(weapon):
            drive_label.text += "   %s" % weapon
        if bool(game.get("shotgun_owned27")) and not drive_label.text.contains("Q SWITCH"):
            drive_label.text += "   Q SWITCH"
