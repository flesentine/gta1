extends CharacterBody2D

var game: Node = null
var health := 6
var max_health := 6
var body_color := Color(0.72, 0.18, 0.22)
var cover_points: Array[Vector2] = []
var cover_target := Vector2.ZERO
var has_cover_target := false
var fire_timer := 0.4
var cover_timer := 0.0
var dead := false
var facing := Vector2.DOWN
var stride := 0.0
var serial := 0

func _ready() -> void:
    add_to_group("pedestrians")
    add_to_group("mission_hostiles")
    queue_redraw()

func configure_hostile(owner_game: Node, spawn: Vector2, points: Array[Vector2], hp: int, index: int) -> void:
    game = owner_game
    global_position = spawn
    cover_points = points
    health = maxi(hp, 1)
    max_health = health
    serial = index
    body_color = [Color(0.68,0.16,0.22), Color(0.56,0.20,0.27), Color(0.72,0.24,0.18), Color(0.48,0.16,0.24), Color(0.75,0.29,0.14)][index % 5]
    queue_redraw()

func take_damage(amount: int) -> void:
    if dead:
        return
    health -= maxi(amount, 0)
    cover_timer = 2.4
    has_cover_target = false
    if health <= 0:
        health = 0
        dead = true
        velocity = Vector2.ZERO
    queue_redraw()

func react_to_gunshot(_origin: Vector2) -> void:
    if not dead:
        cover_timer = maxf(cover_timer, 1.2)

func is_mission_dead() -> bool:
    return dead

func _target_position() -> Vector2:
    if game == null:
        return global_position
    if bool(game.in_vehicle) and is_instance_valid(game.current_vehicle):
        return game.current_vehicle.global_position
    return game.player.global_position

func _choose_cover(target: Vector2) -> Vector2:
    var best := global_position
    var best_score := -1.0e30
    for point in cover_points:
        var score := point.distance_to(target) - point.distance_to(global_position) * 0.45
        if score > best_score:
            best_score = score
            best = point
    return best

func _has_line_of_sight(target: Vector2) -> bool:
    if game == null:
        return false
    var query := PhysicsRayQueryParameters2D.create(global_position, target)
    query.exclude = [get_rid()]
    var result := get_world_2d().direct_space_state.intersect_ray(query)
    if result.is_empty():
        return true
    var collider = result.collider
    if collider == game.player:
        return true
    if bool(game.in_vehicle) and collider == game.current_vehicle:
        return true
    return false

func _fire(target: Vector2) -> void:
    if game == null or dead:
        return
    fire_timer = 0.66 + float(serial % 3) * 0.10
    var end := target
    var normal := (target - global_position).orthogonal().normalized()
    end += normal * randf_range(-34.0, 34.0)
    game.tracers.append({"start": global_position, "end": end, "time": 0.10})
    if randf() > 0.62:
        return
    if bool(game.in_vehicle) and is_instance_valid(game.current_vehicle):
        if game.current_vehicle.has_method("take_damage"):
            game.current_vehicle.take_damage(1)
    elif game.has_method("take_hostile_hit29"):
        game.take_hostile_hit29(1)

func _physics_process(delta: float) -> void:
    if dead or game == null:
        velocity = Vector2.ZERO
        queue_redraw()
        return
    fire_timer = maxf(fire_timer - delta, 0.0)
    cover_timer = maxf(cover_timer - delta, 0.0)
    var target := _target_position()
    var distance := global_position.distance_to(target)
    var seek_cover := cover_timer > 0.0 or health <= int(ceil(float(max_health) / 2.0)) or distance < 135.0
    var destination := target
    var should_move := true

    if seek_cover and not cover_points.is_empty():
        if not has_cover_target:
            cover_target = _choose_cover(target)
            has_cover_target = true
        destination = cover_target
        if global_position.distance_to(destination) <= 22.0:
            should_move = false
    elif distance <= 500.0 and _has_line_of_sight(target):
        should_move = false
        has_cover_target = false

    if should_move:
        var direction := (destination - global_position).normalized()
        if direction.length_squared() < 0.01:
            direction = Vector2.DOWN
        facing = direction
        velocity = direction * (112.0 if seek_cover else 78.0)
        stride += delta * 8.0
        move_and_slide()
    else:
        velocity = Vector2.ZERO
        stride += delta * 0.5

    if fire_timer <= 0.0 and distance <= 540.0 and _has_line_of_sight(target):
        _fire(target)
    queue_redraw()

func _draw() -> void:
    if dead:
        draw_ellipse(Vector2.ZERO, Vector2(15, 7), body_color.darkened(0.45))
        return
    var bob := sin(stride) * 1.2
    draw_circle(Vector2(0, -8 + bob), 5.6, Color(0.76, 0.58, 0.44))
    draw_rect(Rect2(Vector2(-6, -2 + bob), Vector2(12, 16)), body_color, true)
    draw_line(Vector2(3, 1 + bob), Vector2(16, -2 + bob), Color(0.95, 0.68, 0.26), 3.0)
    draw_colored_polygon(PackedVector2Array([Vector2(0,-23),Vector2(6,-15),Vector2(-6,-15)]), Color(1.0,0.25,0.31))
    if cover_timer > 0.0:
        draw_arc(Vector2.ZERO, 18.0, 0.18, PI - 0.18, 16, Color(0.40,0.86,1.0,0.85), 2.0)

func draw_ellipse(center: Vector2, radius: Vector2, color: Color) -> void:
    var points := PackedVector2Array()
    for i in range(20):
        var a := TAU * float(i) / 20.0
        points.append(center + Vector2(cos(a) * radius.x, sin(a) * radius.y))
    draw_colored_polygon(points, color)
