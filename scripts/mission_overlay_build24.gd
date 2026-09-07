extends "res://scripts/mission_overlay_build22.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "twin_strike": return
    var state := str(controller.mission_state)
    if state == "parallel_targets":
        var points = controller.get_parallel_objectives24(); var done = controller.get_parallel_done24()
        for i in range(points.size()):
            if i < done.size() and done[i]: continue
            var color := Color(1.0, 0.82, 0.28, 0.98) if i == 0 else Color(0.28, 0.90, 1.0, 0.98)
            var pulse := 1.0 + sin(phase * 1.8) * 0.10; var halo := color; halo.a = 0.13
            draw_circle(points[i], 58.0 * pulse, halo, true); draw_arc(points[i], 48.0 * pulse, 0.0, TAU, 32, color, 5.0, true)
    elif state == "parallel_deliver":
        var rect = controller.get_parallel_final_delivery24(); var color := Color(0.24, 0.90, 0.48, 0.96); var fill := color; fill.a = 0.18
        draw_rect(rect, fill, true); draw_rect(rect, color, false, 6.0)
