# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 16 — living city + entity cleanup

Build 16 keeps the complete Build 15 city, six missions, four vehicle classes, procedural audio, HUD polish, minimap/navigation, persistent progression, police/wanted loop, combat, traffic, pedestrians, bribes, and respray.

### Entity cleanup

Long-running sessions no longer accumulate every mission car and wreck forever.

- completed/failed mission vehicles are retired after a short grace period
- the active mission vehicle is always protected
- the player's current vehicle is always protected, even after its mission ends
- mission cars driven by the player retire only after the player abandons them
- distant destroyed vehicles retire after a longer delay
- distant abandoned stolen vehicles eventually retire
- stale references are removed from the active vehicle list
- replacement civilian traffic spawns away from the player when traffic density falls below the city floor

### Smarter traffic

Civilian AI now checks the lane space ahead and changes cruise speed when another vehicle is in front of it. Cars progressively slow as spacing closes instead of simply driving at full cruise speed until collision. Browser traffic also shows brake lights while yielding.

### Pedestrian archetypes

Ordinary pedestrians now receive simple behavior profiles:

- **COMMUTER** — faster purposeful walking
- **CAUTIOUS** — reacts to moving vehicles from farther away
- **STROLLER** — slower movement with occasional pauses
- **JOGGER** — fastest normal pedestrian movement

Mission targets keep their dedicated mission behavior and are not overwritten by the civilian archetype system.

### Live-city HUD

The bottom vehicle/on-foot strip now identifies Build 16 and shows current live civilian traffic and pedestrian counts.

## Current missions

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape
6. **RED FLAG** — moving character target + police escape

The first three form the core level path. Clearing CLEAN BREAK at the score target unlocks CROSSTOWN, DEAD DROP, and RED FLAG. Keys **1–6** select unlocked jobs.

## Validation

- `web/game16.js` passes `node --check`
- `web/city16_runtime.js` passes `node --check`
- new Build 16 Godot scripts and scene passed delimiter sanity checks
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
15. Population behavior + entity cleanup
16. Branching mission logic / second authored sector

See `docs/BUILD_PLAN.md` for the implementation checklist.
