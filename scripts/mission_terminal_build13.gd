extends "res://scripts/mission_terminal.gd"

func _tag_build_12() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 9", "BUILD 13").replace("BUILD 11", "BUILD 13").replace("BUILD 12", "BUILD 13")

func _populate_menu() -> void:
    for child in overlay.get_children():
        child.queue_free()

    var panel := ColorRect.new()
    panel.anchor_left = 0.5
    panel.anchor_top = 0.5
    panel.anchor_right = 0.5
    panel.anchor_bottom = 0.5
    panel.offset_left = -310.0
    panel.offset_top = -315.0
    panel.offset_right = 310.0
    panel.offset_bottom = 315.0
    panel.color = Color(0.04, 0.055, 0.07, 0.98)
    panel.mouse_filter = Control.MOUSE_FILTER_STOP
    overlay.add_child(panel)

    var title := Label.new()
    title.position = Vector2(24, 18)
    title.size = Vector2(572, 64)
    title.text = "BUILD 13 — MISSION TERMINAL\nCHOOSE A JOB"
    title.add_theme_font_size_override("font_size", 24)
    panel.add_child(title)

    var unlocked := _unlocked_count()
    var y := 90.0
    for i in range(director.campaign.size()):
        var mission: Dictionary = director.campaign[i]
        var button := Button.new()
        button.position = Vector2(24, y)
        button.size = Vector2(572, 60)
        var mission_title := str(mission.get("title", "MISSION"))
        var mission_type := str(mission.get("type", "mission"))
        var reward := int(mission.get("base_reward", 0))
        var type_label := _type_label(mission_type)
        if i < unlocked:
            button.text = "%d. %s    %s    BASE %d" % [i + 1, mission_title, type_label, reward]
            button.disabled = false
            button.pressed.connect(_select_mission.bind(i))
        else:
            button.text = "%d. %s    LOCKED" % [i + 1, mission_title]
            button.disabled = true
        panel.add_child(button)
        y += 68.0

    var help := Label.new()
    help.position = Vector2(24, 445)
    help.size = Vector2(572, 58)
    help.text = "1–5: select    Esc: close\nCROSSTOWN + DEAD DROP unlock after clearing the core level."
    help.add_theme_font_size_override("font_size", 14)
    panel.add_child(help)

func _type_label(value: String) -> String:
    if value == "mixed_run":
        return "DRIVE + ON-FOOT + ESCAPE"
    return super._type_label(value)

func _unhandled_input(event: InputEvent) -> void:
    if not menu_open or not event is InputEventKey or not event.pressed or event.echo:
        return
    var key := event as InputEventKey
    if key.keycode == KEY_ESCAPE:
        get_viewport().set_input_as_handled()
        _close_menu(true)
        return
    if key.keycode >= KEY_1 and key.keycode <= KEY_5:
        var index := int(key.keycode - KEY_1)
        get_viewport().set_input_as_handled()
        _select_mission(index)
