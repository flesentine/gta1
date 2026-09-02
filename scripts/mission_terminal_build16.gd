extends "res://scripts/mission_terminal_build15.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 9", "BUILD 16").replace("BUILD 11", "BUILD 16").replace("BUILD 12", "BUILD 16").replace("BUILD 13", "BUILD 16").replace("BUILD 14", "BUILD 16").replace("BUILD 15", "BUILD 16")

func _populate_menu() -> void:
    super._populate_menu()
    _replace_build16_text(overlay)

func _replace_build16_text(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 15", "BUILD 16")
    for child in node.get_children():
        _replace_build16_text(child)
