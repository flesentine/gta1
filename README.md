# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 21 — turn pockets, routed pursuit + multi-bonus missions

Build 21 keeps the complete two-sector Build 20 world, Harbor East / Docklands, traffic signals, two-lane civilian traffic, lane changes, living-city cleanup, vehicle classes, procedural audio, minimap/navigation, persistent progression, police/wanted loop, combat, bribes, respray, branching missions, and all ten previous jobs.

### Dedicated turning pockets

Civilian traffic now commits to a turning lane as it approaches a route corner.

- AI detects whether its next route segment turns left or right
- the car moves into the matching lane before reaching the intersection
- ordinary lane changes remain suppressed near intersections
- visible turn-pocket guide marks make the new behavior readable in both builds
- same-lane spacing and Build 19 traffic signals remain active

### Routed police pursuit

Police now use street-grid waypoints when a building blocks a direct line to the player.

- clear line of sight keeps direct pursuit
- blocked line of sight selects an intermediate road-grid waypoint
- reaching the waypoint returns the cruiser to direct pursuit
- wanted levels 1–2 still obey red signals
- wanted levels 3–4 retain emergency signal priority
- close high-heat pursuit drops the detour and attacks directly

### New mission — PERFECT LINE

PERFECT LINE is post-clear job #11 and introduces two independent optional objectives.

1. steal the marked pink courier in Harbor East
2. hit four ordered checkpoints before the **100-second** timer expires
3. the first checkpoints increase police heat
4. **Signal Discipline:** +2,000 before multiplier if no high-speed red-light violation occurs
5. **Untouched Courier:** +3,000 before multiplier if the courier takes no vehicle damage
6. either bonus can be lost independently without failing the mission

Base reward: **7,500 × multiplier**.

Maximum bonus: **+5,000 before multiplier**.

The mission terminal now supports **1–9, 0, and -** for job #11.

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
11. **PERFECT LINE** — four-stop pressure run with two independent bonuses

The first three form the core level path. Clearing the core level unlocks the eight advanced jobs.

## Validation

- `data/missions.json` contains eleven missions
- `web/game21.js` passes `node --check`
- `web/traffic21_runtime.js` passes `node --check`
- Build 21 loader anchor targets the committed Build 20 runtime chain
- Build 21 Godot scripts and scene passed structural/delimiter sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / -** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.

See `docs/BUILD_PLAN.md` for the implementation checklist.
