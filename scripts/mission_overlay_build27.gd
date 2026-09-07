extends "res://scripts/mission_overlay_build26.gd"

func _draw() -> void:
    super._draw()
    var controller := get_parent()
    if controller == null or str(controller.current_mission.get("id", "")) != "runway_raid":
        return
    var state := str(controller.mission_state)
    if state == "raid_armory":
        var p := controller.get_raid_armory27()
        var color := Color(1.0, 0.83, 0.28, 0.98)
        var pulse := 1.0 + sin(phase * 1.9) * 0.10
        draw_arc(p, 48.0 * pulse, 0.0, TAU, 32, color, 5.0, true)
    elif state == "raid_targets":
        var points = controller.get_raid_target_positions27()
        var alive = controller.get_raid_target_alive27()
        for i in range(points.size()):
            if i >= alive.size() or not alive[i]:
                continue
            var color := Color(1.0, 0.24, 0.31, 0.98)
            var halo := color
            halo.a = 0.13
            var pulse := 1.0 + sin(phase * 2.0 + float(i)) * 0.10
            draw_circle(points[i], 52.0 * pulse, halo, true)
            draw_arc(points[i], 42.0 * pulse, 0.0, TAU, 32, color, 4.0, true)
