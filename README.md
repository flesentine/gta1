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
- later: pedestrians, wanted system, pickups, and one complete mission

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

Build 2 has a no-install browser preview that mirrors the current gameplay slice:

**https://cdn.jsdelivr.net/gh/flesentine/gta1@4a4c57a1682d96ee27309311187f3da98d9412e9/web/index.html**

The browser build is intentionally asset-free placeholder art. The Godot project remains the main implementation.

### Build 2
- 10 moving traffic cars
- steal any nearby vehicle with **E**
- traffic follows simple road routes
- speed-sensitive camera zoom
- desktop keyboard controls
- basic touch controls for mobile
