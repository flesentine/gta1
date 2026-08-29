# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 20 — lane intelligence + optional objectives

Build 20 keeps the complete two-sector Build 19 world, traffic signals, Harbor East / Docklands, living-city cleanup, pedestrian archetypes, vehicle classes, procedural audio, minimap/navigation, persistent progression, police/wanted loop, combat, bribes, respray, branching missions, and all nine previous jobs.

### Two-lane civilian traffic

Civilian traffic now uses actual lane offsets instead of every car targeting the same road centerline.

- AI cars alternate between two lane centers
- car-following checks traffic in the same lane instead of braking for vehicles beside it
- blocked traffic can request a lane change
- a lane change only starts when adjacent space is clear
- cars avoid starting lane changes close to intersections
- lane changes use a cooldown to prevent constant weaving
- Build 19 red-light behavior remains active at the same time

### Police + traffic signals

Police now coordinate with the signal system.

- at wanted levels **1–2**, police reduce speed for red lights
- at wanted levels **3–4**, pursuit switches to emergency priority and ignores traffic signals
- this keeps low-level pursuit more believable without making high-level chases too easy

### New mission — GREEN WAVE

GREEN WAVE is post-clear job #10 and introduces the first optional mission bonus.

1. steal the marked green courier in Harbor East
2. hit four ordered checkpoints before the **105-second** timer expires
3. the mission can always be completed normally
4. the optional clean-driving bonus remains active as long as you do not blast through a red signal at speed
5. a red-light violation permanently removes the bonus for that run

Base reward: **7,000 × multiplier**.

Clean-driving bonus: **+2,500 before multiplier**.

The mission terminal now supports **1–9 and 0** for job #10.

## Current missions

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape
6. **RED FLAG** — moving character target + police escape
7. **CROSSROADS** — choose a quiet or hot branching route
8. **EASTBOUND** — timed run into Harbor East / Docklands
9. **NIGHT SHIFT** — four-stop Docklands pressure run
10. **GREEN WAVE** — signal-aware checkpoint run with optional clean bonus

The first three form the core level path. Clearing the core level unlocks the seven advanced jobs.

## Validation

- `data/missions.json` parses cleanly with ten missions
- `web/game20.js` passes `node --check`
- `web/traffic20_runtime.js` passes `node --check`
- Build 20 loader anchor targets the committed Build 19 runtime chain
- Build 20 Godot scripts and scene pass structural/delimiter sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0** — select an unlocked mission
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
19. Lane intelligence, police signal behavior, optional mission objectives

See `docs/BUILD_PLAN.md` for the implementation checklist.
