# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 13 — mixed on-foot + vehicle mission

Build 13 keeps the authored city, minimap, mission terminal, persistent progression, police/wanted loop, combat, traffic, pedestrians, bribes, respray, and all four Build 12 jobs.

### New mission — DEAD DROP

DEAD DROP is the first mission that deliberately switches between vehicle and on-foot play:

1. steal the marked purple getaway car in Market West
2. drive it across the city to the purple Downtown drop lot
3. park below the speed threshold
4. get out of the car
5. collect the marked package on foot
6. immediately take three wanted heads
7. lose all police heat to complete the job

DEAD DROP has a **110-second** mission timer and a **4,000 × multiplier** base reward.

### Mission terminal

Five jobs are now available across progression:

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape

The first three form the core level path. Clearing CLEAN BREAK at the score target unlocks both post-clear jobs, CROSSTOWN and DEAD DROP. Keys **1–5** select unlocked jobs.

### Navigation

The minimap and world markers now advance through DEAD DROP's stages: getaway car → drop lot → package → escape route.

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–5** — select an unlocked mission
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
13. Audio/HUD polish, vehicle variety, and additional mission content

See `docs/BUILD_PLAN.md` for the implementation checklist.
