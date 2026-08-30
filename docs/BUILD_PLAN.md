# Build Plan

## Guiding rule

Prove the core GTA 1 loop with original clean-room content, then expand systems without coupling content coordinates directly to gameplay code.

## Phase 1 — Driving slice

- [x] Godot project boots into a top-down scene
- [x] On-foot movement
- [x] Enter/exit vehicles
- [x] Arcade acceleration, braking, reverse, and steering
- [x] Building/world collision
- [x] Speed-sensitive camera zoom
- [x] Authored city roads/buildings loaded from data
- [x] Vehicle feel differentiated by class
- [x] Broader vehicle-definition variety
- [x] Skid/impact feedback
- [x] Persistent tire-damage handling penalties

## Phase 2 — Living city

- [x] Traffic route graph
- [x] Civilian traffic spawning and route following
- [x] Pedestrian spawning and roaming
- [x] Panic/flee response
- [x] Vehicle health, smoke, fire/burnout state
- [x] Civilian pedestrian behavior archetypes
- [x] Entity cleanup/despawn and replacement traffic
- [x] Traffic spacing, signals, two-lane offsets, safe lane changes
- [x] Turn pockets and forward-look turning arcs
- [x] Movement-aware intersection reservations
- [x] Three-sector traffic and pedestrian population

## Phase 3 — Crime loop

- [x] Weapon framework / pistol / ammo pickups
- [x] Shotgun / shell pickups
- [x] Weapon switching
- [x] Multi-pellet / multi-target weapon behavior
- [x] Wanted stages 0–4
- [x] Police vehicle spawning and pursuit
- [x] Arrest/death/respawn
- [x] Police bribe pickup
- [x] Respray garage
- [x] Multi-waypoint police block routing
- [x] Predictive police intercept point
- [x] Coordinated CHASE / FLANK pursuit roles
- [x] Temporary high-heat roadblocks
- [x] Level-4 spike strips
- [x] Level-4 BOX FRONT / LEFT / RIGHT / REAR pursuit behavior

## Phase 4 — Mission loop

- [x] Data-driven MissionDirector
- [x] Mission-selection terminal
- [x] Steal/deliver, destruction, lose-wanted, timers and failure states
- [x] Score + multiplier rewards and mission unlock/replay flow
- [x] Multi-stage checkpoint chaining
- [x] Mixed vehicle → on-foot → escape objective
- [x] Character target/combat objective
- [x] Branching route-dependent mission choice
- [x] Cross-sector checkpoint mission
- [x] Optional and multiple optional bonus objectives
- [x] Long multi-part mission with vehicle swap and handoff
- [x] Mission fail/retry checkpoint inside a long job
- [x] Parallel objectives / choose-order mission
- [x] Three-sector delivery mission
- [x] Level-4 tactical pursuit mission
- [x] Multi-target combat sweep using weapon-specific gameplay

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] Harbor East / Docklands second sector
- [x] West Ridge / Airfield third sector
- [x] Seamless ~10,800 × 3,400 world and minimap expansion
- [x] District identities, parking lots, alleys, shortcuts and Airfield runway
- [x] Persistent campaign checkpoint, score, multiplier, best score and unlock state
- [x] Browser front-end entry screen
- [x] Thirteen post-clear advanced missions
- [x] Procedural audio and HUD/mission-state polish
- [x] Browser runtime layers execute in one ordered shared-scope bundle
- [x] Explicit browser runtime manifest and stable-core boot boundary
- [x] Broader weapon/combat depth
- [x] Additional West Ridge / Airfield mission content
- [ ] Fully flatten legacy browser core chain into explicit production modules
- [ ] Add additional weapon archetypes / combat reactions
- [ ] Add higher-level campaign sequencing across all three sectors

## Build 27 — shotgun combat + RUNWAY RAID + manifest boot

- adds a shotgun with six-pellet spread, shorter range and slower firing cadence than the pistol
- Q switches between pistol and shotgun
- shotgun shell pickups are placed in West Ridge / Airfield
- shotgun blasts can damage multiple pedestrians/targets in one shot and cap vehicle pellet damage per blast
- RUNWAY RAID adds job #16
- RUNWAY RAID sends the player to the Airfield armory, then spawns three tougher marked targets that can be cleared in any order
- clearing all three targets forces wanted level 4 and requires a full escape
- RUNWAY RAID timer is 150 seconds; base reward is 13,500 × multiplier
- mission terminal adds `/` for job #16
- Build 27 browser boot loads the stable Build 14 core directly instead of chaining through Builds 26/25/24
- `runtime27_manifest.json` explicitly defines the ordered Build 14→27 runtime layer list
- `runtime27_bundle.js` validates and evaluates that manifest list in shared scope
- full legacy core flattening remains a future step

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, optional-bonus state, parallel-objective state, tire damage, weapon inventory, target state, mixed-objective stage, vehicle-swap stage, retry-checkpoint consumption, spike strips, roadblocks, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
