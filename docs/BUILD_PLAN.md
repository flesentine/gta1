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

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] Harbor East / Docklands second sector
- [x] West Ridge / Airfield third sector
- [x] Seamless ~10,800 × 3,400 world and minimap expansion
- [x] District identities, parking lots, alleys, shortcuts and Airfield runway
- [x] Persistent campaign checkpoint, score, multiplier, best score and unlock state
- [x] Browser front-end entry screen
- [x] Twelve post-clear advanced missions
- [x] Procedural audio and HUD/mission-state polish
- [x] Browser runtime layers execute in one ordered shared-scope bundle
- [ ] Flatten browser bootstrap into explicit production modules
- [ ] Broader weapon/combat depth
- [ ] Additional West Ridge / Airfield mission content

## Build 26 — spike strips + LOCKDOWN

- wanted level 4 can deploy temporary spike strips ahead of the predicted player route
- spike strips damage one or two tires depending on impact speed
- tire damage progressively reduces speed, acceleration, braking and steering, with wobble after multiple punctures
- tire condition is visible in the HUD
- level-4 police replace CHASE / FLANK roles with BOX FRONT / LEFT / RIGHT / REAR targets around the player
- Build 24 roadblocks remain active alongside the new spike-strip and box-in tactics
- LOCKDOWN adds job #15 in West Ridge
- LOCKDOWN starts at wanted 2, crosses three West Ridge / Airfield gates, escalates to wanted 4, then requires a full escape and Airfield return
- LOCKDOWN timer is 165 seconds; base reward is 12,500 × multiplier
- mission terminal uses keys 1–9, 0, -, =, ], [, and \\ 
- Build 26 extends the ordered browser runtime bundle through `traffic26_runtime.js`

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, optional-bonus state, parallel-objective state, tire damage, target state, mixed-objective stage, vehicle-swap stage, retry-checkpoint consumption, spike strips, roadblocks, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
