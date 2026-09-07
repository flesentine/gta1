extends "res://scripts/polish_build25.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label == null:
        return
    drive_label.text = drive_label.text.replace("BUILD 25", "BUILD 26")
    var scene = get_tree().current_scene
    var manager = scene.get_node_or_null("WorldManager") if scene != null else null
    var tires := 0
    if manager != null and manager.has_method("get_current_tire_damage26"):
        tires = int(manager.get_current_tire_damage26())
    if not drive_label.text.contains("TIRES"):
        drive_label.text += "   TIRES %d/4" % tires
    if manager != null and manager.has_method("get_box_mode26") and bool(manager.get_box_mode26()):
        if not drive_label.text.contains("BOX MODE"):
            drive_label.text += "   BOX MODE"
    if manager != null and manager.has_method("get_spike_strip_rects26") and manager.get_spike_strip_rects26().size() > 0:
        if not drive_label.text.contains("SPIKES"):
            drive_label.text += "   SPIKES"
