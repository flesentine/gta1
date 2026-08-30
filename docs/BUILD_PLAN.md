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

## Phase 2 — Living city

- [x] Traffic route graph
- [x] Civilian traffic spawning and route following
- [x] Pedestrian spawning and roaming
- [x] Panic/flee response
- [x] Expanded-sector traffic and pedestrian population
- [x] Vehicle health, smoke, fire/burnout state
- [x] Additional pedestrian visual variety in browser build
- [x] Mission NPC with proximity/gunshot flee behavior
- [x] Entity cleanup/despawn rules
- [x] Replacement traffic after cleanup
- [x] Traffic spacing / obstruction pacing
- [x] Civilian pedestrian behavior archetypes
- [x] Multi-sector traffic/pedestrian population
- [x] Intersection right-of-way / traffic signals
- [x] Two-lane road offsets
- [x] Lane-aware following distance
- [x] Safe adjacent-lane checks and lane-change cooldown
- [x] Police signal behavior by pursuit level
- [x] Turn lanes / dedicated turning pockets
- [x] Forward-look turning arcs
- [x] Intersection reservation / conflict holding
- [x] Multi-waypoint police block routing
- [x] Per-movement intersection conflict matrix
- [x] Police predictive intercept point
- [x] Coordinated multi-unit police interception
- [x] Temporary high-heat roadblocks
- [x] Traffic replenishment routes across all three authored sectors

## Phase 3 — Crime loop

- [x] Weapon framework / pistol / ammo pickups
- [x] Wanted stages 0–4
- [x] Police vehicle spawning and pursuit
- [x] Arrest/death/respawn
- [x] Police bribe pickup
- [x] Respray garage
- [x] Procedural feedback for gunfire, wanted state, impacts, and escape events

## Phase 4 — Mission loop

- [x] Data-driven MissionDirector
- [x] Mission-selection terminal
- [x] Steal/deliver objective
- [x] Destroy-target objective
- [x] Lose-wanted objective
- [x] Timers and failure states
- [x] Score + multiplier rewards
- [x] Mission unlock/replay flow
- [x] Multi-stage checkpoint chaining
- [x] Mixed vehicle → on-foot → escape objective
- [x] Character target/combat objective
- [x] Moving target → wanted escape chaining
- [x] Branching mission choice with route-dependent payout/consequences
- [x] Cross-sector checkpoint mission
- [x] Optional bonus objective / secondary mission goal
- [x] Multiple optional objectives in one mission
- [x] Long multi-part mission with vehicle swap and on-foot handoff
- [x] Mission fail/retry checkpoint inside a long job
- [x] Parallel objectives / choose-order mission
- [x] Full three-sector cross-city mission

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] District identities, parking lots, alleys, and shortcuts
- [x] Persistent campaign checkpoint, score, multiplier, best score, and unlock state
- [x] Level-completion / Downtown unlock flow
- [x] Minimap + navigation objective marker
- [x] Browser front-end entry screen
- [x] Eleven post-clear advanced missions
- [x] Procedural audio pass
- [x] HUD / mission-state presentation polish
- [x] Broader vehicle variety
- [x] Civilian pedestrian archetypes
- [x] Character-target/combat mission
- [x] Long-session vehicle cleanup and population replenishment
- [x] Branching mission logic
- [x] Second authored sector: Harbor East / Docklands
- [x] Seamless world-boundary and minimap expansion
- [x] Harbor East mission content
- [x] Browser runtime layers execute in one ordered shared-scope bundle
- [x] Third authored sector: West Ridge / Airfield
- [x] Three-sector seamless world and minimap
- [x] West Ridge traffic / pedestrians / collision / district identity
- [x] Full-city mission content

## Build 25 — WEST RIDGE + AIRMAIL

- add `data/west_ridge.json` as the third authored sector
- expand seamless world to roughly 10,800 × 3,400
- add WEST RIDGE and AIRFIELD district identities
- add 29 building footprints, 4 lots, 4 alleys, 3 road axes, 4 traffic loops, 10 traffic spawns, and 15 pedestrian loops
- add Airfield runway presentation
- extend traffic replenishment to original-city, Harbor East, and West Ridge route graphs
- AIRMAIL adds job #14
- AIRMAIL starts with a white courier in Harbor East and crosses four gates before an Airfield delivery
- AIRMAIL timer is 150 seconds; base reward is 11,500 × multiplier
- mission terminal adds `[` as the job #14 keyboard shortcut
- Build 25 browser loader preloads West Ridge before switching Build 24 to the ordered Build 25 runtime bundle

## Next candidates

- deployable spike strips and tire-damage / temporary handling penalties
- boxed-in police pursuit behavior at wanted level 4
- district-specific ambient traffic archetypes and parked-car pools
- mission chains that start or branch inside West Ridge / Airfield
- begin flattening the browser bootstrap into deliberate modules now that the runtime feature stack is stable

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, optional-bonus state, parallel-objective state, target state, mixed-objective stage, vehicle-swap stage, retry-checkpoint consumption, roadblocks, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
