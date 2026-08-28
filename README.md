# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository starts with a clean-room technical foundation. It does **not** include Rockstar/DMA game assets, maps, audio, mission text, or other extracted copyrighted content.

## Current goal

Build a small playable vertical slice before attempting a full city:

- top-down player movement
- enter/exit vehicles
- arcade vehicle handling
- speed-sensitive camera zoom
- basic collision/world bounds
- moving traffic architecture
- sidewalk pedestrians with car reactions
- pistol/ammo pickups and basic combat
- vehicle damage/burnout states
- later: wanted system, police response, missions, and progression

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
5. Mission state machine
6. First complete level slice

See `docs/BUILD_PLAN.md` for the implementation checklist.

## Play in your browser

The latest development build has a no-install browser preview:

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build is intentionally asset-free placeholder art. The Godot project remains the main implementation. The first visit may show raw.githack's one-time confirmation screen before opening the HTML preview.

### Build 4

- 10 moving traffic cars
- steal any nearby working vehicle with **E**
- 28 pedestrians walking sidewalk loops
- pedestrians flee from fast cars and nearby gunshots
- pistol pickup near the starting position
- finite ammo plus refill pickups
- **Space / F** to shoot while on foot
- pedestrians can be hit by gunfire
- vehicles take bullet damage, smoke, and burn out after repeated hits
- desktop keyboard controls
- mobile touch controls including FIRE
