extends Control

var game: Node
var director: Node
var drive_panel: ColorRect
var drive_label: Label
var banner_panel: ColorRect
var banner_label: Label
var banner_timer := 0.0

var last_ammo := 0
var last_in_vehicle := false
var last_wanted := 0
var last_status := ""
var last_impact := 0.0
var skid_audio_cooldown := 0.0
var event_audio_cooldown := 0.0

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_IGNORE
    set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    game = get_tree().current_scene
    director = game.get_node_or_null("MissionDirector")
    _build_ui()
    last_ammo = int(game.pistol_ammo)
    last_in_vehicle = bool(game.in_vehicle)
    last_wanted = int(game.wanted_level)
    last_status = str(game.status_message)

func _build_ui() -> void:
    drive_panel = ColorRect.new()
    drive_panel.anchor_left = 0.5
    drive_panel.anchor_right = 0.5
    drive_panel.anchor_top = 1.0
    drive_panel.anchor_bottom = 1.0
    drive_panel.offset_left = -190.0
    drive_panel.offset_right = 190.0
    drive_panel.offset_top = -92.0
    drive_panel.offset_bottom = -58.0
    drive_panel.color = Color(0.02, 0.03, 0.04, 0.86)
    drive_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(drive_panel)

    drive_label = Label.new()
    drive_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    drive_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    drive_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    drive_label.add_theme_font_size_override("font_size", 14)
    drive_panel.add_child(drive_label)

    banner_panel = ColorRect.new()
    banner_panel.anchor_left = 0.5
    banner_panel.anchor_right = 0.5
    banner_panel.anchor_top = 0.20
    banner_panel.anchor_bottom = 0.20
    banner_panel.offset_left = -230.0
    banner_panel.offset_right = 230.0
    banner_panel.offset_top = -42.0
    banner_panel.offset_bottom = 42.0
    banner_panel.color = Color(0.03, 0.045, 0.055, 0.96)
    banner_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    banner_panel.visible = false
    add_child(banner_panel)

    banner_label = Label.new()
    banner_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    banner_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    banner_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    banner_label.add_theme_font_size_override("font_size", 20)
    banner_panel.add_child(banner_label)

func _process(delta: float) -> void:
    if game == null:
        return

    skid_audio_cooldown = max(skid_audio_cooldown - delta, 0.0)
    event_audio_cooldown = max(event_audio_cooldown - delta, 0.0)
    banner_timer = max(banner_timer - delta, 0.0)
    if banner_timer <= 0.0 and banner_panel != null:
        banner_panel.visible = false

    _update_drive_hud()
    _watch_audio_events()

func _update_drive_hud() -> void:
    if drive_label == null:
        return

    if bool(game.in_vehicle) and is_instance_valid(game.current_vehicle):
        var vehicle = game.current_vehicle
        var class_name := "SEDAN"
        if vehicle.has_method("get_vehicle_class_name"):
            class_name = str(vehicle.get_vehicle_class_name())
        var hp_text := ""
        if vehicle.has_method("get_health_pair"):
            var hp: Vector2i = vehicle.get_health_pair()
            hp_text = "   HP %d/%d" % [hp.x, hp.y]
        drive_label.text = "BUILD 14   %s   SPEED %03d%s" % [
            class_name,
            int(round(abs(float(vehicle.forward_speed)))),
            hp_text
        ]
    else:
        var weapon := "UNARMED"
        if bool(game.pistol_owned):
            weapon = "PISTOL %03d" % int(game.pistol_ammo)
        drive_label.text = "BUILD 14   ON FOOT   %s" % weapon

func _watch_audio_events() -> void:
    var ammo := int(game.pistol_ammo)
    if ammo < last_ammo and bool(game.pistol_owned):
        _play_notes([[175.0, 0.045, 0.18], [82.0, 0.080, 0.10]])
    elif ammo > last_ammo and event_audio_cooldown <= 0.0:
        _play_notes([[520.0, 0.050, 0.10], [780.0, 0.080, 0.10]])
        event_audio_cooldown = 0.10
    last_ammo = ammo

    var in_vehicle := bool(game.in_vehicle)
    if in_vehicle != last_in_vehicle and event_audio_cooldown <= 0.0:
        _play_notes([[115.0, 0.055, 0.08], [85.0, 0.075, 0.06]])
        event_audio_cooldown = 0.08
    last_in_vehicle = in_vehicle

    var wanted := int(game.wanted_level)
    if wanted > last_wanted and event_audio_cooldown <= 0.0:
        _play_notes([[620.0, 0.060, 0.08], [820.0, 0.080, 0.08]])
        event_audio_cooldown = 0.10
    last_wanted = wanted

    var status := str(game.status_message)
    if status != last_status and not status.is_empty():
        if "COMPLETE" in status or "SECURED" in status:
            _play_notes([[440.0, 0.070, 0.08], [660.0, 0.070, 0.09], [880.0, 0.130, 0.10]])
            _show_banner("MISSION UPDATE", status)
        elif "FAILED" in status or status in ["BUSTED", "WASTED", "GAME OVER"]:
            _play_notes([[260.0, 0.080, 0.08], [185.0, 0.100, 0.08], [120.0, 0.160, 0.09]])
            _show_banner("SETBACK", status)
        elif "MISSION" in status or "TARGET" in status or "PACKAGE" in status:
            _show_banner("OBJECTIVE", status)
    last_status = status

    if bool(game.in_vehicle) and is_instance_valid(game.current_vehicle):
        var vehicle = game.current_vehicle
        var impact = vehicle.get("impact_flash")
        if impact != null:
            var impact_value := float(impact)
            if impact_value > 0.10 and last_impact <= 0.10 and event_audio_cooldown <= 0.0:
                _play_notes([[95.0, 0.090, 0.12]])
                event_audio_cooldown = 0.10
            last_impact = impact_value

        var skid = vehicle.get("skid_strength")
        if skid != null and float(skid) > 0.65 and skid_audio_cooldown <= 0.0:
            _play_notes([[145.0, 0.045, 0.035]])
            skid_audio_cooldown = 0.13
    else:
        last_impact = 0.0

func _show_banner(kicker: String, message: String) -> void:
    if banner_panel == null or banner_label == null:
        return
    banner_label.text = "%s\n%s" % [kicker, message]
    banner_panel.visible = true
    banner_timer = 1.8

func _play_notes(notes: Array) -> void:
    var sample_rate := 22050
    var total_duration := 0.0
    for note in notes:
        total_duration += float(note[1])
    if total_duration <= 0.0:
        return

    var sample_count := int(ceil(total_duration * float(sample_rate)))
    var data := PackedByteArray()
    data.resize(sample_count * 2)

    var cursor := 0
    for note in notes:
        var frequency := float(note[0])
        var duration := float(note[1])
        var volume := float(note[2])
        var note_samples := maxi(1, int(round(duration * float(sample_rate))))
        for i in range(note_samples):
            if cursor >= sample_count:
                break
            var phase := TAU * frequency * float(i) / float(sample_rate)
            var envelope := 1.0 - float(i) / float(note_samples)
            var sample := int(sin(phase) * 32767.0 * volume * envelope)
            data[cursor * 2] = sample & 0xff
            data[cursor * 2 + 1] = (sample >> 8) & 0xff
            cursor += 1

    var stream := AudioStreamWAV.new()
    stream.format = AudioStreamWAV.FORMAT_16_BITS
    stream.mix_rate = sample_rate
    stream.stereo = false
    stream.data = data

    var player := AudioStreamPlayer.new()
    player.stream = stream
    player.volume_db = -3.0
    add_child(player)
    player.finished.connect(player.queue_free)
    player.play()
