# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 26 — spike strips + level-4 box pursuit

Build 26 keeps the full three-sector Build 25 world: the original city, Harbor East / Docklands, and West Ridge / Airfield. Traffic signals, two-lane traffic, turn pockets, movement-aware intersection reservations, coordinated police, roadblocks, vehicle classes, pedestrian archetypes, procedural audio, minimap/navigation, persistence, branching missions, optional bonuses, mission recovery, cleanup/repopulation, combat, bribes, and respray are retained.

### Level-4 pursuit escalation

Wanted level 4 now changes police tactics instead of only increasing pursuit pressure:

- temporary spike strips deploy ahead of the player's predicted route
- crossing a strip damages one or two tires depending on speed
- tire damage persists on that vehicle and progressively reduces top speed, acceleration, braking, and steering authority
- vehicles with multiple damaged tires develop high-speed steering wobble
- the HUD shows tire damage from 0/4 to 4/4
- level-4 police switch from CHASE / FLANK roles to **BOX FRONT / BOX LEFT / BOX RIGHT / BOX REAR**
- box units tighten around a slower target and spread farther ahead around a faster target
- Build 24 two-car roadblocks remain active, so level 4 can combine roadblocks, spike strips, predictive pursuit, and box-in units

### New mission — LOCKDOWN

LOCKDOWN is post-clear job #15 and is built around the new level-4 systems.

1. steal the black West Ridge runner
2. wanted level rises to two heads
3. clear three West Ridge / Airfield gates while police pressure increases
4. clearing the final gate forces wanted level 4
5. survive spike strips, roadblocks, and box-in pursuit until the heat is gone
6. return the same runner to the Airfield service lot

Timer: **165 seconds**.

Base reward: **12,500 × multiplier**.

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

The first three form the core level path. Clearing the core level unlocks the twelve advanced jobs.

## Browser runtime

Build 23 replaced the fragile separated runtime-eval chain with one ordered shared-scope runtime bundle. Build 26 extends that bundle through `traffic26_runtime.js`; pinned older builds remain unchanged.

## Validation

- `data/missions.json` contains fifteen missions and parses as JSON
- `web/game26.js` passes `node --check`
- `web/runtime26_bundle.js` passes `node --check`
- `web/traffic26_runtime.js` passes `node --check`
- new Build 26 Godot scripts and scene passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / - / = / ] / [ / \\** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.
