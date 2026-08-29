# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 18 — Harbor East expansion

Build 18 keeps the complete Build 17 city, seven missions, CROSSROADS branching, living-city cleanup, traffic pacing, pedestrian archetypes, four vehicle classes, procedural audio, minimap/navigation, persistent progression, police/wanted loop, combat, bribes, and respray.

### Second authored sector — HARBOR EAST

The playable world now expands east from the original 5,200 × 3,400 sector into a second authored area stored separately in `data/harbor_east.json`.

Harbor East adds:

- **29** authored building footprints
- **4** parking/service lots
- **4** service alleys
- **3** new north/south road axes
- **4** new civilian traffic loops with **10** initial traffic spawns
- **15** pedestrian loops
- two local identities: **HARBOR EAST** and **DOCKLANDS**
- a seamless expanded world boundary; there is no level-loading transition between sectors
- Harbor traffic routes participate in Build 16 cleanup and replacement-traffic logic
- the minimap expands to include the complete second sector

The original horizontal roads continue into Harbor East, creating direct cross-city routes from Market West/Central/Downtown into the new sector.

### New mission — EASTBOUND

EASTBOUND is post-clear job #8:

1. steal the marked blue harbor car near the eastern edge of the original sector
2. hit the Harbor Gate checkpoint
3. cross the Container Yard checkpoint
4. reach the Docklands checkpoint
5. each of the first two checkpoints adds police heat
6. finish all three checkpoints before the **95-second** timer expires

Base reward: **5,500 × multiplier**.

The mission terminal now supports keys **1–8**.

## Current missions

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape
6. **RED FLAG** — moving character target + police escape
7. **CROSSROADS** — choose a quiet or hot branching route
8. **EASTBOUND** — timed run into Harbor East / Docklands

The first three form the core level path. Clearing the core level unlocks the five advanced jobs.

## Validation

- `data/harbor_east.json` and `data/missions.json` parse cleanly
- `web/game18.js` passes `node --check`
- `web/sector18_runtime.js` passes `node --check`
- the Build 18 loader anchor matches the committed Build 17 runtime chain
- new Build 18 Godot scripts and scene passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–8** — select an unlocked mission
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
18. Intersection right-of-way, lane behavior, and additional sector missions

See `docs/BUILD_PLAN.md` for the implementation checklist.
