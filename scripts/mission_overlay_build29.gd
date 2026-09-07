extends "res://scripts/mission_overlay_build28.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "crossfire":
        return
    var state := str(controller.mission_state)
    var pulse := 1.0 + sin(phase * 2.1) * 0.10
    if state == "crossfire_staging":
        var p := controller.get_crossfire_staging29()
        draw_arc(p, 50.0 * pulse, 0.0, TAU, 32, Color(1.0, 0.68, 0.25, 0.98), 5.0, true)
    elif state == "crossfire_hostiles":
        var points = controller.get_crossfire_positions29()
        var alive = controller.get_crossfire_alive29()
        for i in range(points.size()):
            if i >= alive.size() or not alive[i]:
                continue
            var color := Color(1.0, 0.26, 0.32, 0.98)
            var halo := color
            halo.a = 0.12
            draw_circle(points[i], 42.0 * pulse, halo, true)
            draw_arc(points[i], 33.0 * pulse, 0.0, TAU, 28, color, 3.0, true)
