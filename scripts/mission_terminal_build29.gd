extends "res://scripts/mission_terminal_build28.gd"

func _tag_build_14() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 28", "BUILD 29")

func _populate_menu() -> void:
    super._populate_menu()
    var panel := overlay.get_child(0) if overlay.get_child_count() > 0 else null
    if panel is ColorRect:
        panel.offset_top = -690.0
        panel.offset_bottom = 690.0
        var chapter := Button.new()
        chapter.name = "Chapter29"
        chapter.position = Vector2(330, 20)
        chapter.size = Vector2(240, 54)
        var unlocked := bool(director.level_complete)
        var status := director.get_chapter_status29() if director.has_method("get_chapter_status29") else "START CHAPTER"
        chapter.text = "%s\n%s" % ["CHAPTER ONE", status]
        chapter.disabled = not unlocked
        if unlocked:
            chapter.pressed.connect(_start_chapter29)
        panel.add_child(chapter)
    _retag29(overlay)

func _retag29(node: Node) -> void:
    if node is Label:
        var label := node as Label
        label.text = label.text.replace("BUILD 28", "BUILD 29")
        if label.text.begins_with("1–9"):
            label.position.y = 770.0
            label.text = "1–9, 0, -, =, ], [, \\, /, ., ;: jobs    ,: Chapter One    Esc: close\nCROSSFIRE: staging → armed hostiles using cover → four-head escape."
    elif node is Button:
        var button := node as Button
        button.text = button.text.replace("BUILD 28", "BUILD 29")
    for child in node.get_children():
        _retag29(child)

func _type_label(value: String) -> String:
    if value == "hostile_assault":
        return "ARMED ASSAULT"
    return super._type_label(value)

func _select_mission(index: int) -> void:
    if director != null and director.has_method("is_chapter_active29") and director.is_chapter_active29():
        if not director.has_method("is_chapter_starting29") or not director.is_chapter_starting29():
            director.suspend_chapter29()
    super._select_mission(index)

func _start_chapter29() -> void:
    _close_menu(false)
    if director != null and director.has_method("begin_chapter29"):
        director.begin_chapter29()

func _unhandled_input(event: InputEvent) -> void:
    if menu_open and event is InputEventKey and event.pressed and not event.echo:
        var key := event as InputEventKey
        if key.keycode == KEY_SEMICOLON:
            get_viewport().set_input_as_handled()
            _select_mission(17)
            return
        if key.keycode == KEY_COMMA:
            get_viewport().set_input_as_handled()
            _start_chapter29()
            return
    super._unhandled_input(event)
