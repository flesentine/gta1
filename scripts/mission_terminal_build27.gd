extends "res://scripts/mission_terminal_build26.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 26", "BUILD 27")

func _populate_menu() -> void:
    super._populate_menu()
    var panel := overlay.get_child(0) if overlay.get_child_count() > 0 else null
    if panel is ColorRect:
        panel.offset_top = -615.0
        panel.offset_bottom = 615.0
    _retag27(overlay)

func _retag27(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 26", "BUILD 27")
        if label.text.begins_with("1–9"):
            label.position.y = 680.0
            label.text = "1–9, 0, -, =, ], [, \\, /: select    Esc: close\nRUNWAY RAID: armory → shotgun → 3 targets in any order → four-head escape."
    elif node is Button:
        var button := node as Button
        button.text = button.text.replace("BUILD 26", "BUILD 27")
    for child in node.get_children():
        _retag27(child)

func _type_label(value: String) -> String:
    if value == "combat_sweep":
        return "COMBAT SWEEP"
    return super._type_label(value)

func _unhandled_input(event: InputEvent) -> void:
    if menu_open and event is InputEventKey and event.pressed and not event.echo:
        var key := event as InputEventKey
        if key.keycode == KEY_SLASH:
            get_viewport().set_input_as_handled()
            _select_mission(15)
            return
    super._unhandled_input(event)
