extends CharacterBody2D

@export var walk_speed := 62.0
@export var panic_speed := 185.0
@export var threat_radius := 165.0
@export var hit_radius := 31.0

var route: PackedVector2Array = PackedVector2Array()
var route_index := 0
var body_color := Color(0.22, 0.55, 0.82)
var panic_timer := 0.0
var down_timer := 0.0
var facing := Vector2.DOWN
var stride := 0.0

func _ready() -> void:
    add_to_group("pedestrians")
    queue_redraw()

func configure(new_route: PackedVector2Array, start_index: int, color: Color) -> void:
    route = new_route
    if route.is_empty():
        return
    route_index = posmod(start_index, route.size())
    global_position = route[route_index]
    route_index = (route_index + 1) % route.size()
    body_color = color
    queue_redraw()

func _physics_process(delta: float) -> void:
    if down_timer > 0.0:
        down_timer = max(down_timer - delta, 0.0)
        velocity = Vector2.ZERO
        queue_redraw()
        return

    var threat := _nearest_fast_vehicle()
    if threat != null:
        var distance := global_position.distance_to(threat.global_position)
        if distance <= hit_radius and threat.get_forward_speed_abs() > 115.0:
            down_timer = 2.2
            panic_timer = 0.0
            queue_redraw()
            return
        if distance <= threat_radius:
            panic_timer = 1.35
            var away := (global_position - threat.global_position).normalized()
            if away.length_squared() < 0.01:
                away = Vector2.RIGHT
            velocity = away * panic_speed
            facing = away

    if panic_timer > 0.0:
        panic_timer = max(panic_timer - delta, 0.0)
        if threat == null:
            velocity = facing * panic_speed
    else:
        _walk_route()

    move_and_slide()
    if velocity.length_squared() > 4.0:
        stride += delta * (9.0 if panic_timer > 0.0 else 5.0)
    queue_redraw()

func _walk_route() -> void:
    if route.is_empty():
        velocity = Vector2.ZERO
        return
    var target := route[route_index]
    var offset := target - global_position
    if offset.length() < 22.0:
        route_index = (route_index + 1) % route.size()
        target = route[route_index]
        offset = target - global_position
    facing = offset.normalized()
    velocity = facing * walk_speed

func _nearest_fast_vehicle() -> Node2D:
    var nearest: Node2D = null
    var best := INF
    for node in get_tree().get_nodes_in_group("vehicles"):
        if not is_instance_valid(node) or not node.has_method("get_forward_speed_abs"):
            continue
        if node.get_forward_speed_abs() < 65.0:
            continue
        var d := global_position.distance_squared_to(node.global_position)
        if d < best:
            best = d
            nearest = node
    return nearest

func is_down() -> bool:
    return down_timer > 0.0

func _draw() -> void:
    if down_timer > 0.0:
        draw_ellipse(Vector2.ZERO, Vector2(15.0, 7.0), Color(body_color, 0.72))
        draw_circle(Vector2(12.0, 0.0), 5.0, Color(0.89, 0.72, 0.56))
        return

    var bob := sin(stride) * 1.3
    draw_circle(Vector2(0.0, -8.0 + bob), 5.5, Color(0.89, 0.72, 0.56))
    draw_rect(Rect2(-5.5, -2.0 + bob, 11.0, 15.0), body_color, true)
    var leg := sin(stride) * 3.0
    draw_line(Vector2(-2.5, 13.0), Vector2(-3.5 + leg, 22.0), Color(0.08, 0.08, 0.10), 3.0)
    draw_line(Vector2(2.5, 13.0), Vector2(3.5 - leg, 22.0), Color(0.08, 0.08, 0.10), 3.0)

func draw_ellipse(center: Vector2, radii: Vector2, color: Color) -> void:
    var points := PackedVector2Array()
    for i in range(18):
        var a := TAU * float(i) / 18.0
        points.append(center + Vector2(cos(a) * radii.x, sin(a) * radii.y))
    draw_colored_polygon(points, color)
