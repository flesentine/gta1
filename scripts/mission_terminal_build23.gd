extends "res://scripts/mission_terminal_build22.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 22", "BUILD 23")

func _populate_menu() -> void:
    super._populate_menu()
    _retag_tree(overlay)

func _retag_tree(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 22", "BUILD 23")
        label.text = label.text.replace(
            "HOT SWAP: courier → Harbor gates → handoff → package → escape car → lose heat → safehouse.",
            "HOT SWAP: handoff arms one late-run recovery checkpoint with a 70-second recovery clock."
        )
    elif node is Button:
        var button := node as Button
        button.text = button.text.replace("BUILD 22", "BUILD 23")
    for child in node.get_children():
        _retag_tree(child)
