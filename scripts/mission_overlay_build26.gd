extends "res://scripts/mission_overlay_build25.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "lockdown":
        return
    var state := str(controller.mission_state)
    if state == "lockdown_run":
        var p := controller.get_lockdown_current_point26()
        var color := Color(1.0, 0.48, 0.20, 0.98)
        var pulse := 1.0 + sin(phase * 1.9) * 0.10
        var halo := color
        halo.a = 0.13
        draw_circle(p, 58.0 * pulse, halo, true)
        draw_arc(p, 48.0 * pulse, 0.0, TAU, 32, color, 5.0, true)
    elif state == "lockdown_deliver":
        var rect := controller.get_lockdown_final26()
        var color := Color(0.46, 0.90, 0.40, 0.96)
        var fill := color
        fill.a = 0.18
        draw_rect(rect, fill, true)
        draw_rect(rect, color, false, 6.0)
