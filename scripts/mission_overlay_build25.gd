extends "res://scripts/mission_overlay_build24.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "airmail":
        return
    var state := str(controller.mission_state)
    if state == "airmail_drive":
        var p := controller.get_airmail_current_point25()
        var color := Color(0.96, 0.94, 0.76, 0.98)
        var pulse := 1.0 + sin(phase * 1.8) * 0.10
        var halo := color
        halo.a = 0.13
        draw_circle(p, 58.0 * pulse, halo, true)
        draw_arc(p, 48.0 * pulse, 0.0, TAU, 32, color, 5.0, true)
    elif state == "airmail_deliver":
        var rect := controller.get_airmail_final25()
        var color := Color(0.48, 0.90, 0.42, 0.96)
        var fill := color
        fill.a = 0.18
        draw_rect(rect, fill, true)
        draw_rect(rect, color, false, 6.0)
