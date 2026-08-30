# Build Plan

## Guiding rule

Prove the core GTA 1 loop with original clean-room content, then expand systems without coupling content coordinates directly to gameplay code.

## Phase 1 — Driving slice

- [x] Godot project boots into a top-down scene
- [x] On-foot movement
- [x] Enter/exit vehicles
- [x] Arcade acceleration, braking, reverse, steering, class feel, skid and impact feedback
- [x] Building/world collision and speed-sensitive camera zoom
- [x] Authored city roads/buildings loaded from data
- [x] Persistent tire-damage handling penalties

## Phase 2 — Living city

- [x] Traffic route graph, civilian traffic and pedestrian population
- [x] Panic/flee response and pedestrian behavior archetypes
- [x] Entity cleanup/despawn and replacement traffic
- [x] Traffic spacing, signals, two-lane offsets, safe lane changes and turn pockets
- [x] Movement-aware intersection reservations
- [x] Three-sector traffic and pedestrian population

## Phase 3 — Crime loop

- [x] Weapon framework / pistol / ammo pickups
- [x] Shotgun archetype + shell pickups
- [x] SMG three-round burst archetype + ammo pickups
- [x] Wanted stages 0–4, police pursuit, arrest/death/respawn
- [x] Police bribe pickup and respray garage
- [x] Multi-waypoint and predictive police routing
- [x] CHASE / FLANK roles, high-heat roadblocks, spike strips and BOX pursuit
- [ ] Additional combat reactions / cover / armed hostile archetypes

## Phase 4 — Mission loop

- [x] Data-driven MissionDirector and mission-selection terminal
- [x] Steal/deliver, destruction, lose-wanted, timers and failure states
- [x] Score + multiplier rewards and mission unlock/replay flow
- [x] Chained checkpoints and mixed vehicle/on-foot objectives
- [x] Character target/combat objective
- [x] Branching route-dependent mission choice
- [x] Cross-sector, optional bonus, multi-stage swap and retry-checkpoint missions
- [x] Parallel objectives / choose-order mission
- [x] Three-sector delivery and tactical level-4 pursuit missions
- [x] Shotgun combat sweep mission
- [x] Sequential three-sector combat campaign mission
- [ ] Multi-mission campaign chapters with persistent narrative/state flags

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] Harbor East / Docklands second sector
- [x] West Ridge / Airfield third sector
- [x] Seamless ~10,800 × 3,400 world and minimap expansion
- [x] District identities, lots, alleys, shortcuts and Airfield runway
- [x] Persistent campaign checkpoint, score, multiplier, best score and unlock state
- [x] Browser front-end entry screen
- [x] Fourteen post-clear advanced missions
- [x] Procedural audio and HUD/mission-state polish
- [x] Browser runtime manifest with explicit module order
- [x] Flatten browser bootstrap to raw engine core + explicit runtime modules
- [x] Flatten runtime guard blocks into a real shared lexical scope
- [x] Broader weapon/combat depth with pistol, shotgun and SMG
- [x] Additional West Ridge / Airfield mission content
- [ ] Replace legacy `game8.js` raw engine core with named production modules (`world`, `entities`, `missions`, `ui`, `audio`, `progress`)
- [ ] Add campaign chapter sequencing across mission groups

## Build 28 — flat core + SMG + THREE FRONTS

- Build 28 browser no longer executes the nested Build 9–14 loader chain
- `game28.js` loads `game8.js` directly and injects one Build 28 runtime bundle
- authored city, Harbor East, West Ridge and mission data are preloaded before the runtime starts
- `core28_data_runtime.js`, `core28_ui_runtime.js`, and `core28_missions_runtime.js` explicitly replace the old Build 9–13 string-patch responsibilities
- `runtime28_bundle.js` strips known per-module guard blocks, joins the modules into one lexical source, syntax-checks it, and evaluates once
- SMG fires three low-damage bullets per trigger with tight spread and 0.22-second cadence
- Q cycles pistol / shotgun / SMG based on ownership
- THREE FRONTS adds job #17 and moves the player Harbor East → Central → West Ridge under escalating heat
- final stage forces wanted level 4 and requires a full escape
- THREE FRONTS timer is 190 seconds; base reward is 15,000 × multiplier
- mission terminal adds `.` for job #17

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, optional-bonus state, parallel-objective state, weapon ammo/ownership, tire damage, target state, mixed-objective stage, vehicle-swap stage, retry-checkpoint consumption, spike strips, roadblocks, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
