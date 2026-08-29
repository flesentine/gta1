# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 19 — traffic signals + Harbor content

Build 19 keeps the complete Build 18 two-sector city, Harbor East/Docklands expansion, eight previous missions, CROSSROADS branching, living-city cleanup, pedestrian archetypes, four vehicle classes, procedural audio, minimap/navigation, persistent progression, police/wanted loop, combat, bribes, and respray.

### Intersection right-of-way

Civilian traffic now combines Build 16 vehicle-spacing behavior with intersection signal control.

- major road crossings receive deterministic alternating signal phases
- east/west traffic and north/south traffic get separate green windows
- short all-red transition windows reduce opposing traffic entering together
- AI detects the next intersection ahead and progressively slows toward a red signal
- close cars can nearly stop at the line instead of driving through the crossing
- the existing car-ahead spacing factor remains active at the same time
- visible red/green signal indicators are drawn at nearby intersections
- the same logic operates in the original city and Harbor East because it uses the shared road axes

### New mission — NIGHT SHIFT

NIGHT SHIFT is post-clear job #9 and stays entirely inside Harbor East / Docklands:

1. steal the marked yellow dock van in Harbor East
2. hit four ordered dock stops
3. slow below **115** to register each stop
4. the first three completed stops add police heat
5. finish the route before the **110-second** timer expires

Base reward: **6,500 × multiplier**.

The mission terminal now supports keys **1–9**.

## Current missions

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape
6. **RED FLAG** — moving character target + police escape
7. **CROSSROADS** — choose a quiet or hot branching route
8. **EASTBOUND** — timed run into Harbor East / Docklands
9. **NIGHT SHIFT** — four-stop Harbor East / Docklands pressure run

The first three form the core level path. Clearing the core level unlocks the six advanced jobs.

## Validation

- `data/missions.json` parses cleanly with nine missions
- `web/game19.js` passes `node --check`
- `web/traffic19_runtime.js` passes `node --check`
- the Build 19 loader anchor matches the committed Build 18 runtime chain
- new Build 19 Godot scripts and scene passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.

## Development order

1. Driving + camera + collisions
2. Traffic + pedestrians
3. Damage + weapons + pickups
4. Wanted/police loop
5. Arrest/death + escape tools
6. Mission state machine
7. Mini campaign, scoring, timer objectives
8. Persistent progression and unlocks
9. Authored city sector / content pipeline
10. Navigation + mission selection
11. Chained checkpoint objectives
12. Mixed vehicle/on-foot mission flow
13. Audio/HUD polish + vehicle and pedestrian variety
14. Character-target/combat mission
15. Population behavior + entity cleanup
16. Branching mission logic
17. Second authored sector / Harbor East expansion
18. Intersection right-of-way + additional Harbor mission
19. Optional objectives, lane refinement, and deeper police/traffic interaction

See `docs/BUILD_PLAN.md` for the implementation checklist.
