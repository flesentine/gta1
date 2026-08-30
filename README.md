# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 27 — shotgun combat + direct manifest boot

Build 27 keeps the full three-sector world (original city, Harbor East / Docklands, and West Ridge / Airfield), Build 26 tire damage / spike strips / box pursuit, coordinated police, traffic simulation, mission recovery, branching objectives, vehicle classes, procedural audio, minimap/navigation, persistence, cleanup/repopulation, bribes, and respray.

### Shotgun combat

The pistol is no longer the only weapon:

- **Q** switches between pistol and shotgun when both are owned
- shotgun uses **6 pellets per blast**
- short effective range with a wide spread
- slower 0.72-second firing cadence
- one blast can hit multiple targets
- vehicle pellet damage is capped per blast
- shotgun and shell pickups are placed around West Ridge / Airfield
- nearby pedestrians react to the louder blast
- weapon and shell count are shown in the HUD

### New mission — RUNWAY RAID

RUNWAY RAID is post-clear job #16 and the first mission built specifically around the shotgun.

1. reach the Airfield armory on foot
2. acquire the shotgun and mission shells
3. clear three marked West Ridge / Airfield targets in any order
4. each target is tougher than a normal pedestrian
5. clearing all three forces wanted level 4
6. survive spike strips, roadblocks, predictive box units, and lose all heat

Timer: **150 seconds**.

Base reward: **13,500 × multiplier**.

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
16. **RUNWAY RAID** — shotgun armory, three combat targets, level-4 escape

The first three form the core level path. Clearing the core level unlocks the thirteen advanced jobs.

## Browser runtime

Build 27 begins the browser-bootstrap cleanup.

Instead of loading Build 26 → Build 25 → Build 24 to discover the latest runtime, `game27.js` now:

1. loads the stable Build 14 core bootstrap directly
2. preloads Harbor East and West Ridge data
3. loads `runtime27_manifest.json`
4. replaces only the stable runtime injection point
5. executes the manifest's ordered runtime list through `runtime27_bundle.js`

This is **phase 1** of flattening, not a complete rewrite: the stable Build 14 core still contains the older core-resolution chain. New Build 27 runtime composition is now explicit and data-driven, making the next flattening step much safer.

## Validation

- `data/missions.json` contains sixteen missions and parses as JSON
- `web/runtime27_manifest.json` parses as JSON and lists the Build 14→27 runtime modules explicitly
- `web/game27.js` passes `node --check`
- `web/runtime27_bundle.js` passes `node --check`
- `web/combat27_runtime.js` passes `node --check`
- new Build 27 Godot scripts and scene passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire current weapon while on foot
- **Q** — switch pistol / shotgun
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / - / = / ] / [ / \\ / /** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.
