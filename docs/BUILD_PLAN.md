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
- [x] Second-sector traffic/pedestrian population
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
- [ ] Coordinated multi-unit police interception / roadblocks

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
- [ ] Parallel objectives / choose-order mission

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] District identities, parking lots, alleys, and shortcuts
- [x] Persistent campaign checkpoint, score, multiplier, best score, and unlock state
- [x] Level-completion / Downtown unlock flow
- [x] Minimap + navigation objective marker
- [x] Browser front-end entry screen
- [x] Nine post-clear advanced missions
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
- [ ] Third authored district/sector

## Build 23 — conflict matrix + predictive pursuit + HOT SWAP recovery

- intersection reservations identify approach direction and straight / left / right movement
- compatible movements can reserve the same junction simultaneously
- opposing straight-through traffic and compatible right turns no longer block each other unnecessarily
- incompatible movement combinations continue to hold outside the intersection
- traffic lights, same-lane spacing, turn pockets, and smooth turn arcs remain active
- police predict a short future player position from motion before choosing an intercept route
- prediction lead increases during higher wanted levels
- Build 22 multi-hop block routing now targets the predicted intercept point
- HOT SWAP arms one recovery checkpoint when the first courier reaches the handoff/package stage
- one late non-life-loss failure restores the package stage instead of restarting all seven stages
- recovery clears heat, removes the failed escape car, and restores at least 70 seconds
- HUD reports recovery availability/consumption
- browser loader now boots from Build 14 and evaluates runtime modules 14→23 as one ordered bundle to avoid strict-eval helper isolation

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, optional-bonus state, target state, mixed-objective stage, vehicle-swap stage, retry-checkpoint consumption, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
