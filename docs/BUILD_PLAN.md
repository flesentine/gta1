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
- [ ] Entity pooling/despawn rules
- [ ] Broader civilian pedestrian archetypes

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
- [ ] More branching mission logic

## Phase 5 — Full level slice

- [x] Authored 5,200 × 3,400 city sector
- [x] District identities, parking lots, alleys, and shortcuts
- [x] Persistent campaign checkpoint, score, multiplier, best score, and unlock state
- [x] Level-completion / Downtown unlock flow
- [x] Minimap + navigation objective marker
- [x] Browser front-end entry screen
- [x] Three post-clear advanced missions
- [x] Procedural audio pass
- [x] HUD / mission-state presentation polish
- [x] Broader vehicle variety
- [x] Initial pedestrian visual variety
- [x] Character-target/combat mission
- [ ] Additional mission content
- [ ] Second authored sector

## Build 15 — RED FLAG

- sixth mission slot in the terminal
- post-clear moving character target
- higher target health than ordinary pedestrians
- proximity-triggered fleeing and gunshot reaction
- live world/minimap tracking while the target moves
- 90-second objective timer
- guaranteed pistol + minimum 16 rounds at mission start
- target takedown escalates to three wanted heads
- escape stage completes only after all heat is cleared
- 5,000 base reward multiplied by the active score multiplier

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next mission, best score, and unlock state. Active mission entities, target state, mixed-objective stage, and timers intentionally restart from the latest safe checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
