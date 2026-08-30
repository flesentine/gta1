extends "res://scripts/polish_build20.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label != null:
        drive_label.text = drive_label.text.replace("BUILD 20", "BUILD 21")
        if not drive_label.text.contains("TURN POCKETS"):
            drive_label.text += "   TURN POCKETS"
