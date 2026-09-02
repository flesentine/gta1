extends "res://scripts/pedestrian.gd"

var mission_dead := false
var game: Node = null

func _ready() -> void:
    super._ready()
    add_to_group("mission_targets")
    game = get_tree().current_scene

func configure_target(new_route: PackedVector2Array, color: Color, hit_points: int = 4) -> void:
    configure(new_route, 0, color)
    walk_speed = 78.0
    panic_speed = 225.0
    threat_radius = 185.0
    health = maxi(hit_points, 1)
    mission_dead = false

func take_damage(amount: int) -> void:
    if mission_dead:
        return
    health -= amount
    if health <= 0:
        health = 0
        mission_dead = true
        dead_timer = 99999.0
        down_timer = 0.0
        panic_timer = 0.0
        velocity = Vector2.ZERO
    else:
        panic_timer = 3.0
    queue_redraw()

func _physics_process(delta: float) -> void:
    if not mission_dead and game != null and game.has_method("_player_target"):
        var threat = game._player_target()
        if is_instance_valid(threat):
            var offset: Vector2 = global_position - threat.global_position
            if offset.length() <= 260.0:
                if offset.length_squared() < 0.01:
                    offset = Vector2.RIGHT
                facing = offset.normalized()
                panic_timer = max(panic_timer, 1.45)
    super._physics_process(delta)

func is_mission_dead() -> bool:
    return mission_dead

func _draw() -> void:
    super._draw()
    if mission_dead:
        return
    var pulse := 1.0 + sin(Time.get_ticks_msec() * 0.006) * 0.08
    draw_arc(Vector2.ZERO, 16.0 * pulse, 0.0, TAU, 24, Color(1.0, 0.22, 0.28, 0.90), 2.5, true)
