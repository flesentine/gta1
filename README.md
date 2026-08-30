# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 22 — intersection reservations + HOT SWAP

Build 22 keeps the complete two-sector Build 21 world, Harbor East / Docklands, traffic signals, two-lane traffic, turn pockets, police/wanted systems, vehicle classes, pedestrian archetypes, procedural audio, minimap/navigation, persistence, branching missions, optional bonuses, cleanup/repopulation, combat, bribes, and respray.

### Intersection reservations + smoother turns

Civilian traffic now does more than obey lights and lane spacing:

- cars approaching a green intersection request a short reservation before entering
- conflicting cars hold outside the junction until the reservation clears
- reservations expire automatically and do not replace red-light logic
- turn-pocket cars receive a forward-look arc target as they approach a corner, so steering begins through the turn instead of snapping at the waypoint
- active reservations are visible as cyan rings at nearby intersections

### Multi-hop police pursuit

Police routing now supports a short street-grid path instead of only one detour point.

- when a building blocks direct pursuit, cruisers compare two Manhattan-style street routes
- the lower-cost route can contain multiple waypoints
- blocked route segments receive a large penalty
- cruisers consume waypoints as they reach them
- clear line of sight returns police to direct interception
- close wanted-level 3–4 pursuit still drops the detour and attacks directly
- Build 20 signal behavior remains: low-level police respect red lights, high-level emergency pursuit ignores them

### New mission — HOT SWAP

HOT SWAP is post-clear job #12 and the first seven-stage mission chain:

1. steal the teal courier in Downtown
2. clear two Harbor gates
3. park in the Harbor East handoff lot below the speed limit
4. get out and collect the package on foot
5. steal the newly spawned black escape car
6. survive three-head police heat and lose the cops
7. return the escape car to the Downtown safehouse

Timer: **150 seconds**.

Base reward: **9,500 × multiplier**.

The active escape car replaces the first courier as the protected mission vehicle, so Build 16 cleanup cannot retire it during the handoff.

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
12. **HOT SWAP** — seven-stage courier / package / escape-car chain

The first three form the core level path. Clearing the core level unlocks the nine advanced jobs.

## Validation

- `data/missions.json` contains twelve missions
- `web/game22.js` passes `node --check`
- `web/traffic22_runtime.js` passes `node --check`
- Build 22 loader anchor targets the committed Build 21 runtime chain
- new Build 22 Godot scripts passed delimiter/structure sanity checks
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
