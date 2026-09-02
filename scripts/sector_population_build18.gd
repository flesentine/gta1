extends "res://scripts/sector_population.gd"

const HARBOR_PATH_BUILD18 := "res://data/harbor_east.json"
const VEHICLE_BUILD18 = preload("res://scripts/vehicle.gd")
const PEDESTRIAN_BUILD18 = preload("res://scripts/pedestrian.gd")

func _ready() -> void:
    super._ready()
    call_deferred("_spawn_harbor_population")

func _spawn_harbor_population() -> void:
    var game := get_parent()
    if game == null or not FileAccess.file_exists(HARBOR_PATH_BUILD18):
        return
    var file := FileAccess.open(HARBOR_PATH_BUILD18, FileAccess.READ)
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
            var car = VEHICLE_BUILD18.new()
            car.name = "HarborTraffic%02d" % i
            var collision := CollisionShape2D.new()
            var shape := RectangleShape2D.new()
            shape.size = Vector2(34, 64)
            collision.shape = shape
            car.add_child(collision)
            game.add_child(car)
            car.add_to_group("vehicles")
            car.configure_ai(routes[route_index], point_index, traffic_colors[i % traffic_colors.size()], 190.0 + float((i % 4) * 17))
            car.set_meta("build16_base_cruise", float(car.get("ai_cruise_speed")))
            game.vehicles.append(car)

    var ped_routes := _route_array(parsed.get("pedestrian_routes", []))
    for i in range(ped_routes.size()):
        var route: PackedVector2Array = ped_routes[i]
        if route.is_empty():
            continue
        var ped = PEDESTRIAN_BUILD18.new()
        ped.name = "HarborPedestrian%02d" % i
        ped.walk_speed = 50.0 + float((i % 6) * 5)
        var collision := CollisionShape2D.new()
        var shape := CircleShape2D.new()
        shape.radius = 8.5
        collision.shape = shape
        ped.add_child(collision)
        game.add_child(ped)
        ped.configure(route, i % route.size(), pedestrian_colors[i % pedestrian_colors.size()])
        game.pedestrians.append(ped)
