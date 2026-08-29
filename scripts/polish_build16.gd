extends "res://scripts/polish_build15.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label == null:
        return
    drive_label.text = drive_label.text.replace("BUILD 15", "BUILD 16")
    var manager = game.get_node_or_null("WorldManager") if game != null else null
    if manager != null and manager.has_method("get_live_traffic_count"):
        drive_label.text += "   CITY %dC/%dP" % [
            int(manager.get_live_traffic_count()),
            int(manager.get_live_pedestrian_count())
        ]
