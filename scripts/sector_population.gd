extends Node2D

const SECTOR_PATH := "res://data/city_sector.json"
const VEHICLE_SCRIPT = preload("res://scripts/vehicle.gd")
const PEDESTRIAN_SCRIPT = preload("res://scripts/pedestrian.gd")

var traffic_colors := [
    Color(0.12, 0.55, 0.86), Color(0.92, 0.57, 0.15),
    Color(0.23, 0.72, 0.43), Color(0.72, 0.32, 0.72),
    Color(0.82, 0.82, 0.78), Color(0.18, 0.19, 0.22),
    Color(0.84, 0.28, 0.18)
]

var pedestrian_colors := [
    Color(0.18, 0.50, 0.82), Color(0.85, 0.32, 0.24),
    Color(0.20, 0.66, 0.40), Color(0.72, 0.44, 0.74),
    Color(0.90, 0.62, 0.18), Color(0.34, 0.34, 0.38)
]

func _ready() -> void:
    call_deferred("_spawn_sector_population")

func _spawn_sector_population() -> void:
    var game := get_parent()
    if game == null or not FileAccess.file_exists(SECTOR_PATH):
        return

    var file := FileAccess.open(SECTOR_PATH, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return

    var routes := _route_array(parsed.get("outer_traffic_routes", []))
    var spawns = parsed.get("outer_traffic_spawns", [])
    if spawns is Array:
        for i in range(spawns.size()):
            var plan = spawns[i]
            if not plan is Array or plan.size() < 2 or routes.is_empty():
                continue
            var route_index := clampi(int(plan[0]), 0, routes.size() - 1)
            var point_index := int(plan[1])
            var car = VEHICLE_SCRIPT.new()
            car.name = "SectorTraffic%02d" % i

            var collision := CollisionShape2D.new()
            var shape := RectangleShape2D.new()
            shape.size = Vector2(34, 64)
            collision.shape = shape
            car.add_child(collision)

            game.add_child(car)
            car.add_to_group("vehicles")
            car.configure_ai(
                routes[route_index],
                point_index,
                traffic_colors[i % traffic_colors.size()],
                195.0 + float((i % 4) * 16)
            )
            game.vehicles.append(car)

    var ped_routes := _route_array(parsed.get("outer_pedestrian_routes", []))
    for i in range(ped_routes.size() * 2):
        if ped_routes.is_empty():
            break
        var route: PackedVector2Array = ped_routes[i % ped_routes.size()]
        if route.is_empty():
            continue
        var ped = PEDESTRIAN_SCRIPT.new()
        ped.name = "SectorPedestrian%02d" % i
        ped.walk_speed = 48.0 + float((i % 6) * 5)

        var collision := CollisionShape2D.new()
        var shape := CircleShape2D.new()
        shape.radius = 8.5
        collision.shape = shape
        ped.add_child(collision)

        game.add_child(ped)
        ped.configure(route, i % route.size(), pedestrian_colors[i % pedestrian_colors.size()])
        game.pedestrians.append(ped)

func _route_array(items: Variant) -> Array[PackedVector2Array]:
    var result: Array[PackedVector2Array] = []
    if not items is Array:
        return result
    for item in items:
        if not item is Array:
            continue
        var route := PackedVector2Array()
        for point in item:
            if point is Array and point.size() >= 2:
                route.append(Vector2(float(point[0]), float(point[1])))
        if route.size() >= 2:
            result.append(route)
    return result
