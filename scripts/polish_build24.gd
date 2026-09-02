extends "res://scripts/polish_build23.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label != null:
        drive_label.text = drive_label.text.replace("BUILD 23", "BUILD 24")
        if not drive_label.text.contains("COORDINATED COPS"): drive_label.text += "   COORDINATED COPS"
        var manager = get_tree().current_scene.get_node_or_null("WorldManager")
        if manager != null and manager.has_method("get_roadblock_count") and int(manager.get_roadblock_count()) > 0:
            if not drive_label.text.contains("ROADBLOCK"): drive_label.text += "   ROADBLOCK"
