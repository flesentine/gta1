extends "res://scripts/mission_terminal_build24.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 24", "BUILD 25")

func _populate_menu() -> void:
    super._populate_menu()
    var panel := overlay.get_child(0) if overlay.get_child_count() > 0 else null
    if panel is ColorRect:
        panel.offset_top = -535.0
        panel.offset_bottom = 535.0
    _retag25(overlay)

func _retag25(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 24", "BUILD 25")
        if label.text.begins_with("1–9"):
            label.position.y = 590.0
            label.text = "1–9, 0, -, =, ], [: select    Esc: close\nAIRMAIL: Harbor East → full-city crossing → West Ridge airfield."
    elif node is Button:
        var button := node as Button
        button.text = button.text.replace("BUILD 24", "BUILD 25")
    for child in node.get_children():
        _retag25(child)

func _type_label(value: String) -> String:
    if value == "cross_sector_delivery":
        return "3-SECTOR RUN"
    return super._type_label(value)

func _unhandled_input(event: InputEvent) -> void:
    if menu_open and event is InputEventKey and event.pressed and not event.echo:
        var key := event as InputEventKey
        if key.keycode == KEY_BRACKETLEFT:
            get_viewport().set_input_as_handled()
            _select_mission(13)
            return
    super._unhandled_input(event)
