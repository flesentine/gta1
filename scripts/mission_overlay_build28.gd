extends "res://scripts/mission_overlay_build27.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "three_fronts":
        return
    var state := str(controller.mission_state)
    var pulse := 1.0 + sin(phase * 2.0) * 0.10
    if state == "front_armory":
        var p := controller.get_front_armory28()
        draw_arc(p, 48.0 * pulse, 0.0, TAU, 32, Color(0.38, 0.91, 1.0, 0.98), 5.0, true)
    elif state == "front_target":
        var p := controller.get_front_target_position28()
        var colors := [Color(1.0, 0.33, 0.27), Color(1.0, 0.76, 0.29), Color(0.78, 0.46, 1.0)]
        var color: Color = colors[clampi(controller.get_front_index28(), 0, 2)]
        var halo := color
        halo.a = 0.13
        draw_circle(p, 52.0 * pulse, halo, true)
        draw_arc(p, 42.0 * pulse, 0.0, TAU, 32, color, 4.0, true)
