# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 28 — flat browser core + SMG + THREE FRONTS

Build 28 keeps the complete three-sector world from Builds 25–27: the original city, Harbor East / Docklands, and West Ridge / Airfield. Vehicle classes, traffic signals, movement-aware intersections, coordinated police, roadblocks, spike strips, tire damage, BOX pursuit, pedestrian behavior, procedural audio, persistence, minimap/navigation, mission recovery, branching missions, bonuses, pistol combat, shotgun combat, and all previous missions remain available.

### Browser core flattening

Build 28 removes the nested browser bootstrap chain from the live build.

The browser now boots from:

1. `game8.js` as the small raw engine core
2. authored city / Harbor East / West Ridge / mission JSON data
3. `runtime28_manifest.json`
4. one flattened, ordered runtime source containing explicit Build 28 core modules plus Builds 14–28

`game14.js`, `game13.js`, `game12.js`, and the other historical loaders remain in the repository only so pinned older builds still work. Build 28 does **not** execute them.

The Build 28 runtime bundler also removes each known runtime module's outer guard block before the modules are joined. That means build-suffixed `let`, `const`, and function helpers now actually share one lexical runtime scope. The final flattened source is syntax-checked with `new Function(...)` before execution.

`core28_data_runtime.js`, `core28_ui_runtime.js`, and `core28_missions_runtime.js` replace the old Build 9–13 string-patch layer with explicit code for:

- authored base city data
- save/load progression
- level unlock overlay
- mission terminal
- minimap/navigation
- CROSSTOWN chained checkpoints
- DEAD DROP mixed vehicle/on-foot flow

### Third weapon — SMG

Build 28 adds an original compact SMG archetype:

- Q cycles among every owned weapon
- three-round burst per trigger
- 520-unit effective range
- tight three-ray spread
- one damage per bullet against pedestrians/mission targets
- vehicle damage capped to one point per burst
- 0.22-second trigger cadence
- stronger nearby pedestrian suppression/panic than the pistol
- dedicated SMG and ammo pickups in Harbor East
- browser and Godot HUDs show current weapon/ammo

The shotgun remains the high-damage short-range option while the pistol remains the precise single-shot baseline.

### New mission — THREE FRONTS

THREE FRONTS is post-clear job #17 and is the first combat mission deliberately sequenced across all three sectors.

1. travel to the Harbor East armory
2. receive the SMG and 90 rounds
3. clear the Harbor target
4. cross the city and clear the Central target
5. cross into West Ridge and clear the final target
6. police pressure increases as each front falls
7. the third target forces wanted level 4
8. lose all heat to complete the job

Timer: **190 seconds**.

Base reward: **15,000 × multiplier**.

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
14. **AIRMAIL** — full three-sector Harbor East → West Ridge airfield run
15. **LOCKDOWN** — West Ridge level-4 pursuit with spike strips and box units
16. **RUNWAY RAID** — shotgun combat sweep + four-head escape
17. **THREE FRONTS** — SMG combat sequenced Harbor → Central → West Ridge + four-head escape

The first three form the core level path. Clearing the core level unlocks the fourteen advanced jobs.

## Validation

- `data/missions.json` contains seventeen missions and parses as JSON
- `web/runtime28_manifest.json` parses as JSON
- `web/game28.js` passes `node --check`
- `web/runtime28_bundle.js` passes `node --check`
- `web/core28_data_runtime.js`, `web/core28_ui_runtime.js`, and `web/core28_missions_runtime.js` pass `node --check`
- `web/combat28_weapons_runtime.js` and `web/combat28_mission_runtime.js` pass `node --check`
- new Build 28 Godot scripts and scene passed delimiter/structure sanity checks
- the flattened runtime performs an additional browser-time syntax check before evaluation
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire current weapon while on foot
- **Q** — cycle owned weapons
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / - / = / ] / [ / \\ / / / .** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The first visit may show raw.githack's one-time confirmation page.
