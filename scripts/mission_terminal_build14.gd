extends "res://scripts/mission_terminal_build13.gd"

func _tag_build_11() -> void:
    _tag_build_14()

func _tag_build_12() -> void:
    _tag_build_14()

func _tag_build_13() -> void:
    _tag_build_14()

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 9", "BUILD 14").replace("BUILD 11", "BUILD 14").replace("BUILD 12", "BUILD 14").replace("BUILD 13", "BUILD 14")

func _populate_menu() -> void:
    super._populate_menu()
    _replace_build_text(overlay)

func _replace_build_text(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 13", "BUILD 14")
    for child in node.get_children():
        _replace_build_text(child)
