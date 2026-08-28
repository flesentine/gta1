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
- arrest/death/lives loop
- police bribes and respray escape mechanics
- data-driven mission definitions
- first replayable phone → steal → deliver mission
- score and multiplier progression

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
- Walk into the **blue phone** — start the current mission
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

### Build 7 — HOT PROPERTY

Build 7 adds the first complete replayable mission loop on top of everything in Build 6.

- blue phone mission trigger near the starting area
- original prototype mission: **HOT PROPERTY**
- mission target spawns as a marked teal sedan
- animated yellow target ring/arrow identifies the required vehicle
- stealing the target transitions the mission to delivery
- yellow delivery bay appears across town
- stop the correct vehicle in the delivery bay to complete the mission
- base reward: **1,000 × current multiplier**
- completing the mission increases the multiplier, up to x5
- score and multiplier remain through ordinary life losses
- mission fails if the target is destroyed or the player loses a life
- mission phone reopens after a short cooldown so the loop is replayable
- mission configuration lives in `data/missions.json`
- all Build 6 police, lives, bribes, respray, combat, traffic, and pedestrians remain active during the mission
