# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 24 — coordinated pursuit + TWIN STRIKE

Build 24 keeps the complete two-sector world, Harbor East / Docklands, traffic signals, two-lane traffic, turn pockets, smooth turn arcs, movement-aware intersection reservations, predictive pursuit, HOT SWAP recovery, vehicle classes, pedestrian archetypes, procedural audio, minimap/navigation, persistence, branching missions, optional bonuses, cleanup/repopulation, combat, bribes, respray, and all prior jobs.

### Coordinated police tactics

High-heat police now coordinate instead of all aiming at the same intercept point:

- pursuit units rotate through **CHASE**, **FLANK A**, and **FLANK B** roles
- flank units target lateral intercept positions around the predicted player path
- Build 23 predictive targeting and multi-hop street routing remain active
- wanted level 3+ can deploy a temporary two-car roadblock ahead of the predicted route
- roadblocks expire automatically and clear when heat drops below three heads
- browser roadblocks are physical collision zones; Godot roadblocks are parked collision-enabled vehicle bodies
- HUD shows when a roadblock is active

### New mission — TWIN STRIKE

TWIN STRIKE is post-clear job #13 and the first choose-order mission.

1. steal the orange runner
2. clear the **West Cache** and **Harbor Cache** in either order
3. both objectives remain marked until completed
4. each cache adds police pressure
5. after both caches are cleared, the player is pushed to at least three wanted heads
6. lose all heat
7. return the same runner to the Downtown safehouse

Timer: **140 seconds**.

Base reward: **10,500 × multiplier**.

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

The first three form the core level path. Clearing the core level unlocks the ten advanced jobs.

## Browser runtime

Build 23 replaced the fragile separated runtime eval chain with an ordered shared-scope bundle. Build 24 extends that bundle through `traffic24_runtime.js`, so the build-specific traffic and police helpers intentionally share one scope while pinned older builds remain unchanged.

## Validation

- `data/missions.json` contains thirteen missions and parses as JSON
- `web/game24.js` passes `node --check`
- `web/runtime24_bundle.js` passes `node --check`
- `web/traffic24_runtime.js` passes `node --check`
- Build 24 Godot scripts and scene passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / - / = / ]** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.
