extends "res://scripts/mission_terminal_build21.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 21", "BUILD 22")

func _populate_menu() -> void:
    for child in overlay.get_children():
        child.queue_free()
    var panel := ColorRect.new()
    panel.anchor_left = 0.5
    panel.anchor_top = 0.5
    panel.anchor_right = 0.5
    panel.anchor_bottom = 0.5
    panel.offset_left = -380.0
    panel.offset_top = -470.0
    panel.offset_right = 380.0
    panel.offset_bottom = 470.0
    panel.color = Color(0.04, 0.055, 0.07, 0.98)
    panel.mouse_filter = Control.MOUSE_FILTER_STOP
    overlay.add_child(panel)
    var title := Label.new()
    title.position = Vector2(24, 8)
    title.size = Vector2(712, 52)
    title.text = "BUILD 22 — MISSION TERMINAL\nCHOOSE A JOB"
    title.add_theme_font_size_override("font_size", 24)
    panel.add_child(title)
    var unlocked := _unlocked_count()
    var y := 60.0
    for i in range(director.campaign.size()):
        var mission: Dictionary = director.campaign[i]
        var button := Button.new()
        button.position = Vector2(24, y)
        button.size = Vector2(712, 37)
        var reward := int(mission.get("base_reward", 0))
        var extra := ""
        if str(mission.get("id", "")) == "perfect_line":
            extra = " +2 BONUSES"
        elif str(mission.get("id", "")) == "hot_swap":
            extra = " +7 STAGES"
        elif int(mission.get("bonus_reward", 0)) > 0:
            extra = " + BONUS %d" % int(mission.get("bonus_reward", 0))
        if i < unlocked:
            button.text = "%d. %s    %s    BASE %d%s" % [i + 1, str(mission.get("title", "MISSION")), _type_label(str(mission.get("type", "mission"))), reward, extra]
            button.pressed.connect(_select_mission.bind(i))
        else:
            button.text = "%d. %s    LOCKED" % [i + 1, str(mission.get("title", "MISSION"))]
            button.disabled = true
        panel.add_child(button)
        y += 39.0
    var help := Label.new()
    help.position = Vector2(24, 548)
    help.size = Vector2(712, 88)
    help.text = "1–9, 0, -, =: select    Esc: close\nHOT SWAP: courier → Harbor gates → handoff → package → escape car → lose heat → safehouse."
    help.add_theme_font_size_override("font_size", 14)
    panel.add_child(help)

func _type_label(value: String) -> String:
    if value == "multi_stage_swap":
        return "7-STAGE HOT SWAP"
    return super._type_label(value)

func _unhandled_input(event: InputEvent) -> void:
    if not menu_open or not event is InputEventKey or not event.pressed or event.echo:
        return
    var key := event as InputEventKey
    if key.keycode == KEY_ESCAPE:
        get_viewport().set_input_as_handled()
        _close_menu(true)
        return
    if key.keycode >= KEY_1 and key.keycode <= KEY_9:
        get_viewport().set_input_as_handled()
        _select_mission(int(key.keycode - KEY_1))
        return
    if key.keycode == KEY_0:
        get_viewport().set_input_as_handled()
        _select_mission(9)
        return
    if key.keycode == KEY_MINUS:
        get_viewport().set_input_as_handled()
        _select_mission(10)
        return
    if key.keycode == KEY_EQUAL:
        get_viewport().set_input_as_handled()
        _select_mission(11)
