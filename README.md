# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 10 — authored city sector

Build 10 replaces the repeated test-grid feeling with a larger authored sector and a reusable city-content pipeline.

The playable world is now substantially larger and includes four visually distinct areas:

- **Central** — the original core play area, now surrounded by more varied block shapes
- **Market West** — tighter blocks, service alleys, and parking shortcuts
- **Warehouse Row** — broad loading areas, open parking space, and long industrial blocks
- **Downtown** — denser eastern blocks and the destination represented by Build 9's progression unlock

City layout now lives in `data/city_sector.json`. It defines world bounds, road axes, 51 authored building footprints, parking lots, service alleys, district labels, traffic routes/spawns, pedestrian loops, and landmark positions.

A new `SectorPopulation` layer reads the same data in Godot and adds traffic/pedestrians to the outer neighborhoods without hard-coding them into `main.gd`.

### Campaign locations now use the expanded map

- **HOT PROPERTY** starts in a Downtown parking area and delivers to a Warehouse Row lot.
- **SHORT FUSE** places its target in an eastern parking area.
- **CLEAN BREAK** continues to use the full wanted/police escape loop across the expanded city.

## Build 9 progression retained

- score, multiplier, next mission checkpoint, level-clear state, and best score remain persistent
- browser persistence continues through `localStorage`
- Godot persistence continues through `user://gta1_build9_progress.json`
- reaching the 5,000-point target and completing the campaign unlocks Downtown progression state
- **R** resets the browser world while keeping progression
- **Shift+R** clears the browser progression save

## Engine

Godot 4.x

## Run locally

1. Install Godot 4.x.
2. Clone this repository.
3. Open `project.godot`.
4. Press **F6/F5**.

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **R** — reset

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the expanded sector using the same `data/city_sector.json` source and keeps the clean-room placeholder presentation.

## Development order

1. Driving + camera + collisions
2. Traffic + pedestrians
3. Damage + weapons + pickups
4. Wanted/police loop
5. Arrest/death + escape tools
6. Mission state machine
7. Mini campaign, scoring, timer objectives
8. Persistent level progression
9. Authored city/content pipeline
10. Mission selection, richer objectives, HUD/menu/audio polish

See `docs/BUILD_PLAN.md` for the implementation checklist.
