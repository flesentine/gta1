extends "res://scripts/polish_build24.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label != null:
        drive_label.text = drive_label.text.replace("BUILD 24", "BUILD 25")
        if not drive_label.text.contains("3 SECTORS"):
            drive_label.text += "   3 SECTORS"
