# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 15 — character target + pursuit

Build 15 keeps the complete Build 14 city, vehicle classes, procedural audio, HUD polish, minimap/navigation, persistent progression, police/wanted loop, traffic, pedestrians, bribes, respray, and all five previous missions.

### New mission — RED FLAG

RED FLAG is the first dedicated character-target mission:

1. select RED FLAG from the mission terminal after clearing the core level
2. receive a pistol and at least 16 rounds
3. track the marked red target through a Downtown sidewalk loop
4. the target begins fleeing when the player gets close and also reacts to gunfire
5. take down the higher-health target before the 90-second timer expires
6. immediately face a three-head wanted response
7. lose all police heat to complete the job

RED FLAG has a **90-second** timer and a **5,000 × multiplier** base reward.

The minimap and world marker track the target while they move, then switch to escape guidance after the target is down.

### Mission terminal

Six jobs are now available across progression:

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape
6. **RED FLAG** — moving character target + police escape

The first three form the core level path. Clearing CLEAN BREAK at the score target unlocks all three post-clear jobs: CROSSTOWN, DEAD DROP, and RED FLAG. Keys **1–6** select unlocked jobs.

### Build 14 polish retained

- Compact, Sedan, Muscle, and Van vehicle classes
- class-specific handling, body size, speed, turning, braking, and HP
- procedural engine/police/event audio
- skid marks, impact sparks, and browser screen shake
- bottom-center class/speed/HP HUD
- stronger mission banners and pedestrian visual variety

## Validation

- `web/game15.js` passes `node --check`
- `web/mission15_runtime.js` passes `node --check`
- new Build 15 Godot scripts passed delimiter sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–6** — select an unlocked mission
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
15. Deeper population behavior, entity cleanup, and additional mission content

See `docs/BUILD_PLAN.md` for the implementation checklist.
