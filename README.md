# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 25 — WEST RIDGE + AIRMAIL

Build 25 keeps the complete Build 24 traffic, police, mission, persistence, audio, combat, minimap, vehicle-class, pedestrian, cleanup, branching, bonus, recovery, parallel-objective, and roadblock systems, then expands the world west with a third authored sector.

### Third authored sector — WEST RIDGE / AIRFIELD

The seamless city now spans roughly **10,800 × 3,400** world units from West Ridge through the original city to Harbor East.

West Ridge adds:

- **29** authored building footprints
- **4** parking/service lots
- **4** service alleys
- **3** new major vertical road axes
- **4** traffic loops
- **10** initial civilian traffic spawns
- **15** pedestrian loops
- a southwest **AIRFIELD** district with runway markings
- seamless road, collision, district-label, minimap, signal, lane, turn-pocket, intersection-reservation, police-routing, and roadblock coverage

Build 25 also extends the long-session traffic manager so replacement traffic can use the original city, Harbor East, **and West Ridge** route graphs.

### New mission — AIRMAIL

AIRMAIL is post-clear job #14 and the first mission deliberately built around the full three-sector width.

1. steal the white courier in Harbor East
2. cross four gated checkpoints through Harbor East, Downtown/Central, and West Ridge
3. police pressure rises during the cross-city run
4. keep the same courier alive
5. deliver it to the West Ridge Airfield

Timer: **150 seconds**.

Base reward: **11,500 × multiplier**.

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
11. **PERFECT LINE** — courier run with two independent bonuses
12. **HOT SWAP** — seven-stage courier / package / escape-car chain with one handoff recovery
13. **TWIN STRIKE** — two caches in either order, police escape, runner return
14. **AIRMAIL** — Harbor East-to-West Ridge full-city courier run

The first three form the core level path. Clearing the core level unlocks the eleven advanced jobs.

## Browser runtime

Build 23 replaced the fragile separated runtime eval chain with an ordered shared-scope bundle. Build 25 extends that bundle through `sector25_runtime.js`. The Build 25 loader also preloads `west_ridge.json` before the runtime bundle executes so the western world boundary, roads, collisions, population, and mission content arrive atomically.

## Validation

- `data/west_ridge.json` parses as JSON
- `data/missions.json` contains fourteen missions and parses as JSON
- `web/game25.js` passes `node --check`
- `web/runtime25_bundle.js` passes `node --check`
- `web/sector25_runtime.js` passes `node --check`
- Build 25 Godot scripts and scene passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / - / = / ] / [** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.
