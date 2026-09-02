extends "res://scripts/mission_terminal_build27.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 27", "BUILD 28")

func _populate_menu() -> void:
    super._populate_menu()
    var panel := overlay.get_child(0) if overlay.get_child_count() > 0 else null
    if panel is ColorRect:
        panel.offset_top = -655.0
        panel.offset_bottom = 655.0
    _retag28(overlay)

func _retag28(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 27", "BUILD 28")
        if label.text.begins_with("1–9"):
            label.position.y = 725.0
            label.text = "1–9, 0, -, =, ], [, \\, /, .: select    Esc: close\nTHREE FRONTS: Harbor SMG → Harbor target → Central target → West Ridge target → escape."
    elif node is Button:
        var button := node as Button
        button.text = button.text.replace("BUILD 27", "BUILD 28")
    for child in node.get_children():
        _retag28(child)

func _type_label(value: String) -> String:
    if value == "cross_sector_combat":
        return "CROSS-SECTOR COMBAT"
    return super._type_label(value)

func _unhandled_input(event: InputEvent) -> void:
    if menu_open and event is InputEventKey and event.pressed and not event.echo:
        var key := event as InputEventKey
        if key.keycode == KEY_PERIOD:
            get_viewport().set_input_as_handled()
            _select_mission(16)
            return
    super._unhandled_input(event)
