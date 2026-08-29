extends Node

var director: Node
var game: Node
var overlay: ColorRect
var menu_open := false
var dismissed_until_leave := false

func _init() -> void:
    process_priority = -100
    process_mode = Node.PROCESS_MODE_ALWAYS

func _ready() -> void:
    director = get_parent()
    game = director.get_parent()
    _build_overlay()

func _process(_delta: float) -> void:
    if director == null or game == null:
        return

    call_deferred("_tag_build_12")

    var state := str(director.mission_state)
    var near_phone := not bool(game.in_vehicle) and game.player.global_position.distance_to(director.phone_position) <= 34.0

    if state == "menu":
        return

    if state == "menu_wait":
        if game.player.global_position.distance_to(director.phone_position) > 58.0:
            dismissed_until_leave = false
            director.mission_state = "available"
        return

    if state != "available":
        if menu_open:
            _close_menu(false)
        return

    if not near_phone:
        dismissed_until_leave = false
        return

    if not menu_open and not dismissed_until_leave:
        _open_menu()

func _tag_build_12() -> void:
    if director != null and director.hud_label != null:
        director.hud_label.text = director.hud_label.text.replace("BUILD 9", "BUILD 12").replace("BUILD 11", "BUILD 12")

func _build_overlay() -> void:
    var layer := CanvasLayer.new()
    layer.layer = 70
    add_child(layer)

    overlay = ColorRect.new()
    overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    overlay.color = Color(0.0, 0.0, 0.0, 0.76)
    overlay.mouse_filter = Control.MOUSE_FILTER_STOP
    overlay.visible = false
    layer.add_child(overlay)

func _open_menu() -> void:
    if menu_open:
        return
    menu_open = true
    director.mission_state = "menu"
    get_tree().paused = true
    _populate_menu()
    overlay.visible = true

func _populate_menu() -> void:
    for child in overlay.get_children():
        child.queue_free()

    var panel := ColorRect.new()
    panel.anchor_left = 0.5
    panel.anchor_top = 0.5
    panel.anchor_right = 0.5
    panel.anchor_bottom = 0.5
    panel.offset_left = -300.0
    panel.offset_top = -275.0
    panel.offset_right = 300.0
    panel.offset_bottom = 275.0
    panel.color = Color(0.04, 0.055, 0.07, 0.98)
    panel.mouse_filter = Control.MOUSE_FILTER_STOP
    overlay.add_child(panel)

    var title := Label.new()
    title.position = Vector2(24, 20)
    title.size = Vector2(550, 64)
    title.text = "BUILD 12 — MISSION TERMINAL\nCHOOSE A JOB"
    title.add_theme_font_size_override("font_size", 24)
    panel.add_child(title)

    var unlocked := _unlocked_count()
    var y := 96.0
    for i in range(director.campaign.size()):
        var mission: Dictionary = director.campaign[i]
        var button := Button.new()
        button.position = Vector2(24, y)
        button.size = Vector2(550, 66)
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
        y += 76.0

    var help := Label.new()
    help.position = Vector2(24, 416)
    help.size = Vector2(550, 64)
    help.text = "1–4: select    Esc: close\nCROSSTOWN unlocks after clearing the level."
    help.add_theme_font_size_override("font_size", 14)
    panel.add_child(help)

func _unlocked_count() -> int:
    var total := director.campaign.size()
    if bool(director.level_complete):
        return total
    if int(director.best_score) >= 2500:
        return mini(3, total)
    if int(director.best_score) >= 1000:
        return mini(2, total)
    return maxi(1, mini(int(director.campaign_index) + 1, total))

func _type_label(value: String) -> String:
    match value:
        "steal_deliver":
            return "STEAL + DELIVER"
        "destroy_target":
            return "TIMED DESTRUCTION"
        "lose_wanted":
            return "GETAWAY"
        "checkpoint_run":
            return "3-STAGE COURIER RUN"
        _:
            return value.to_upper()

func _select_mission(index: int) -> void:
    if index < 0 or index >= _unlocked_count():
        return
    director.campaign_index = index
    director.mission_state = "available"
    director.mission_cooldown = 0.0
    director.mission_timer = 0.0
    director.mission_target_vehicle = null
    director.chain_index = 0
    director._load_current_mission()
    director._save_progress()
    _close_menu(false)
    director._start_mission()

func _close_menu(dismiss: bool = true) -> void:
    if not menu_open:
        return
    menu_open = false
    overlay.visible = false
    get_tree().paused = false
    if dismiss:
        dismissed_until_leave = true
        director.mission_state = "menu_wait"

func _unhandled_input(event: InputEvent) -> void:
    if not menu_open or not event is InputEventKey or not event.pressed or event.echo:
        return
    var key := event as InputEventKey
    if key.keycode == KEY_ESCAPE:
        get_viewport().set_input_as_handled()
        _close_menu(true)
        return
    if key.keycode >= KEY_1 and key.keycode <= KEY_4:
        var index := int(key.keycode - KEY_1)
        get_viewport().set_input_as_handled()
        _select_mission(index)
