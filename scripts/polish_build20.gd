extends "res://scripts/polish_build19.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label != null:
        drive_label.text = drive_label.text.replace("BUILD 19", "BUILD 20")
        if not drive_label.text.contains("LANES"):
            drive_label.text += "   LANES + SIGNALS"
