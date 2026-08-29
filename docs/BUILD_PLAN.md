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
- [ ] Intersection right-of-way / lane-change behavior

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
- [ ] Optional bonus objectives / secondary mission goals

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] District identities, parking lots, alleys, and shortcuts
- [x] Persistent campaign checkpoint, score, multiplier, best score, and unlock state
- [x] Level-completion / Downtown unlock flow
- [x] Minimap + navigation objective marker
- [x] Browser front-end entry screen
- [x] Five post-clear advanced missions
- [x] Procedural audio pass
- [x] HUD / mission-state presentation polish
- [x] Broader vehicle variety
- [x] Civilian pedestrian archetypes
- [x] Character-target/combat mission
- [x] Long-session vehicle cleanup and population replenishment
- [x] Branching mission logic
- [x] Second authored sector: Harbor East / Docklands
- [x] Seamless world-boundary and minimap expansion
- [ ] More Harbor East mission content
- [ ] Third authored district/sector

## Build 18 — Harbor East

- second sector stored in `data/harbor_east.json`
- 2,600 × 3,400 eastward expansion
- 29 building footprints
- 4 parking lots and 4 service alleys
- 3 new road axes
- Harbor East + Docklands identities
- 4 traffic loops / 10 initial traffic vehicles
- 15 pedestrian loops
- traffic cleanup/replenishment extended into the new sector
- minimap bounds and geometry expand seamlessly
- EASTBOUND adds an eighth mission and a 95-second three-checkpoint run into the new sector
- first two EASTBOUND checkpoints add police heat
- 5,500 base reward multiplied by active multiplier

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, target state, mixed-objective stage, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
