# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository starts with a clean-room technical foundation. It does **not** include Rockstar/DMA game assets, maps, audio, mission text, or other extracted copyrighted content.

## Current goal

Build a small playable vertical slice before attempting a full city:

- top-down player movement
- enter/exit vehicles
- arcade vehicle handling
- speed-sensitive camera zoom
- moving traffic
- sidewalk pedestrians with panic reactions
- pistol/ammo pickups and combat
- vehicle damage/burnout states
- four-stage wanted system and police pursuit
- later: arrest/death loop, police bribes/respray, missions, score, and progression

## Engine

Godot 4.x

## Run

1. Install Godot 4.x.
2. Clone this repository.
3. Open `project.godot` in Godot.
4. Press **F6/F5** to run.

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit the nearby vehicle
- **Space / F** — fire pistol while on foot
- **R** — reset the prototype

## Development order

1. Driving + camera + collisions
2. Traffic + pedestrians
3. Damage + weapons + pickups
4. Wanted/police loop
5. Arrest/death + escape tools
6. Mission state machine
7. First complete level slice

See `docs/BUILD_PLAN.md` for the implementation checklist.

## Play in your browser

The latest development build has a no-install browser preview:

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build is intentionally asset-free placeholder art. The Godot project remains the main implementation. The first visit may show raw.githack's one-time confirmation screen before opening the HTML preview.

### Build 5

- 10 moving civilian traffic cars
- steal traffic vehicles with **E**; first theft raises wanted level
- 28 pedestrians walking sidewalk loops
- pedestrians flee from fast cars and gunshots
- pistol pickup and finite ammo/refill pickups
- pedestrian and civilian-vehicle gun damage
- damaged cars smoke and burn out
- **four wanted levels** displayed as filled/empty heads
- police cars spawn dynamically as wanted level rises
- police pursue the player on foot or in whichever vehicle is being driven
- police cars use flashing red/blue lightbars and aggressive pursuit speeds
- higher wanted levels increase police count and pursuit speed
- wanted level cools only when enough distance is opened from police
- desktop keyboard and mobile touch controls
