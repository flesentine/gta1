extends "res://scripts/polish_build18.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label != null:
        drive_label.text = drive_label.text.replace("BUILD 18", "BUILD 19")
