# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 23 — movement conflict matrix + predictive pursuit

Build 23 keeps the complete two-sector world, Harbor East / Docklands, traffic signals, two-lane traffic, turn pockets, smooth turn arcs, mission systems, police/wanted loop, vehicle classes, pedestrian archetypes, procedural audio, minimap/navigation, persistence, branching missions, optional bonuses, cleanup/repopulation, combat, bribes, respray, and all twelve jobs.

### Per-movement intersection conflicts

Build 22's one-car-per-junction reservation has been replaced by a movement-aware reservation layer.

- reservations identify approach direction plus straight / left / right movement
- compatible movements can reserve the same intersection simultaneously
- opposing straight-through movements are allowed together
- compatible right-turn combinations can proceed together
- conflicting movements still hold outside the junction
- signal stopping and same-lane spacing remain active
- nearby active movement reservations show cyan feedback in the browser

### Predictive police interception

Police no longer route only toward the player's current coordinates.

- cruisers estimate a short future intercept point from the player's motion
- prediction lead increases during higher wanted levels
- block routing targets the predicted intercept rather than the stale current position
- multi-hop street-grid routing from Build 22 remains active
- close wanted-level 3–4 pursuit still switches to aggressive direct interception

### HOT SWAP recovery checkpoint

HOT SWAP remains the seven-stage job introduced in Build 22, but parking in the handoff lot now arms one late-run recovery checkpoint.

- checkpoint arms when the courier reaches the handoff/package stage
- one late failure can restore the player to the package handoff instead of restarting the whole mission
- recovery clears police heat, removes the failed escape car, and restores the package stage
- recovery restarts the late run with at least **70 seconds** remaining
- losing a life still causes the normal full mission failure
- the HUD reports **RECOVERY READY** or **RECOVERY USED**

### Browser runtime reliability

Build 23 also repairs a latent browser-module scope issue. Builds 14–22 loaded runtime layers through separate strict-mode `eval()` calls, which meant helper declarations were not guaranteed to be visible to later modules. Build 23 now:

1. boots from the stable Build 14 injector
2. preloads Harbor East data
3. fetches the Build 14→23 runtime modules in order
4. evaluates the ordered module bundle once so their build-suffixed helpers share one runtime scope

Pinned older builds remain unchanged.

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

The first three form the core level path. Clearing the core level unlocks the nine advanced jobs.

## Validation

- `web/game23.js` passes `node --check`
- `web/runtime23_bundle.js` passes `node --check`
- `web/traffic23_runtime.js` passes `node --check`
- Build 23 bootstrap explicitly replaces the Build 14 runtime injection with the ordered Build 23 bundle
- new Build 23 Godot scripts passed delimiter/structure sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–9 / 0 / - / =** — select an unlocked mission
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.
