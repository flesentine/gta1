extends "res://scripts/sector_population_build18.gd"

const WEST_PATH_BUILD25 := "res://data/west_ridge.json"
const VEHICLE_BUILD25 = preload("res://scripts/vehicle.gd")
const PEDESTRIAN_BUILD25 = preload("res://scripts/pedestrian.gd")

func _ready() -> void:
    super._ready()
    call_deferred("_spawn_west_population25")

func _spawn_west_population25() -> void:
    var game := get_parent()
    if game == null or not FileAccess.file_exists(WEST_PATH_BUILD25):
        return
    var file := FileAccess.open(WEST_PATH_BUILD25, FileAccess.READ)
    if file == null:
        return
    var parsed = JSON.parse_string(file.get_as_text())
    if not parsed is Dictionary:
        return
    var routes := _route_array(parsed.get("traffic_routes", []))
    var spawns = parsed.get("traffic_spawns", [])
    if spawns is Array:
        for i in range(spawns.size()):
            var plan = spawns[i]
            if not plan is Array or plan.size() < 2 or routes.is_empty():
                continue
            var route_index := clampi(int(plan[0]), 0, routes.size() - 1)
            var point_index := int(plan[1])
            var car = VEHICLE_BUILD25.new()
            car.name = "WestTraffic%02d" % i
            var collision := CollisionShape2D.new()
            var shape := RectangleShape2D.new()
            shape.size = Vector2(34, 64)
            collision.shape = shape
            car.add_child(collision)
            game.add_child(car)
            car.add_to_group("vehicles")
            car.configure_ai(routes[route_index], point_index, traffic_colors[(i + 2) % traffic_colors.size()], 188.0 + float((i % 4) * 18))
            car.set_meta("build16_base_cruise", float(car.get("ai_cruise_speed")))
            car.set_meta("build25_sector", "west_ridge")
            game.vehicles.append(car)
    var ped_routes := _route_array(parsed.get("pedestrian_routes", []))
    for i in range(ped_routes.size()):
        var route: PackedVector2Array = ped_routes[i]
        if route.is_empty():
            continue
        var ped = PEDESTRIAN_BUILD25.new()
        ped.name = "WestPedestrian%02d" % i
        ped.walk_speed = 50.0 + float((i % 6) * 5)
        var collision := CollisionShape2D.new()
        var shape := CircleShape2D.new()
        shape.radius = 8.5
        collision.shape = shape
        ped.add_child(collision)
        game.add_child(ped)
        ped.configure(route, i % route.size(), pedestrian_colors[(i + 3) % pedestrian_colors.size()])
        ped.set_meta("build25_sector", "west_ridge")
        game.pedestrians.append(ped)
