extends "res://scripts/polish_build21.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label != null:
        drive_label.text = drive_label.text.replace("BUILD 21", "BUILD 22")
        if not drive_label.text.contains("RESERVATIONS"):
            drive_label.text += "   RESERVATIONS + ROUTED COPS"
