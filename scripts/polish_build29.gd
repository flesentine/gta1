extends "res://scripts/polish_build28.gd"

func _update_drive_hud() -> void:
    super._update_drive_hud()
    if drive_label == null:
        return
    drive_label.text = drive_label.text.replace("BUILD 28", "BUILD 29")
    var game = get_tree().current_scene
    if game != null and not bool(game.in_vehicle) and game.has_method("get_combat_armor29"):
        drive_label.text += "   ARMOR %d" % int(game.get_combat_armor29())
    var director = get_tree().current_scene.get_node_or_null("MissionDirector") if get_tree().current_scene != null else null
    if director != null and director.has_method("is_chapter_active29") and director.is_chapter_active29():
        var status := director.get_chapter_status29() if director.has_method("get_chapter_status29") else "ACTIVE"
        drive_label.text += "   CHAPTER %s" % status.replace("RESUME ", "")
