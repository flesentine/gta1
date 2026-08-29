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
- [x] Mission NPC with proximity/gunshot flee behavior
- [x] Entity cleanup/despawn rules
- [x] Replacement traffic after cleanup
- [x] Traffic spacing / obstruction pacing
- [x] Civilian pedestrian behavior archetypes
- [x] Second-sector traffic/pedestrian population
- [x] Intersection right-of-way / signal phases
- [ ] Lane offset / lane-change refinement
- [ ] Police and civilian traffic coordination at intersections

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
- [x] Harbor-only multi-stop pressure mission
- [ ] Optional bonus objectives / secondary mission goals

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] District identities, parking lots, alleys, and shortcuts
- [x] Persistent campaign checkpoint, score, multiplier, best score, and unlock state
- [x] Level-completion / Downtown unlock flow
- [x] Minimap + navigation objective marker
- [x] Browser front-end entry screen
- [x] Six post-clear advanced missions
- [x] Procedural audio pass
- [x] HUD / mission-state presentation polish
- [x] Broader vehicle variety
- [x] Civilian pedestrian archetypes
- [x] Character-target/combat mission
- [x] Long-session vehicle cleanup and population replenishment
- [x] Branching mission logic
- [x] Second authored sector: Harbor East / Docklands
- [x] Seamless world-boundary and minimap expansion
- [x] Additional Harbor East mission content
- [ ] Third authored district/sector

## Build 19 — signals + NIGHT SHIFT

- deterministic 12-second traffic-signal cycle at major road crossings
- separate horizontal and vertical green phases with short all-red transitions
- AI looks ahead for the next crossing and progressively brakes on red
- signal factor combines with Build 16 car-following / spacing logic
- visible red/green signal indicators in Godot and browser builds
- intersection system automatically covers both original city and Harbor East road axes
- NIGHT SHIFT adds mission #9
- 110-second four-stop route entirely within Harbor East / Docklands
- first three stops increase police heat
- 6,500 base reward multiplied by active multiplier
- mission terminal supports keys 1–9

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, route choices, target state, mixed-objective stage, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
