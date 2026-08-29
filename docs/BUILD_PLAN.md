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
- [ ] Tune vehicle feel further
- [ ] Broader vehicle-definition variety
- [ ] Skid/impact feedback

## Phase 2 — Living city

- [x] Traffic route graph
- [x] Civilian traffic spawning and route following
- [x] Pedestrian spawning and roaming
- [x] Panic/flee response
- [x] Expanded-sector traffic and pedestrian population
- [x] Vehicle health, smoke, fire/burnout state
- [ ] Entity pooling/despawn rules

## Phase 3 — Crime loop

- [x] Weapon framework / pistol / ammo pickups
- [x] Wanted stages 0–4
- [x] Police vehicle spawning and pursuit
- [x] Arrest/death/respawn
- [x] Police bribe pickup
- [x] Respray garage

## Phase 4 — Mission loop

- [x] Data-driven MissionDirector
- [x] Phone mission trigger
- [x] Steal/deliver objective
- [x] Destroy-target objective
- [x] Lose-wanted objective
- [x] Timers and failure states
- [x] Score + multiplier rewards
- [x] Three-mission core campaign
- [x] Mission selection terminal
- [x] Mission unlock/replay flow
- [x] Multi-stage objective chaining inside one mission
- [x] Timed checkpoint-run objective
- [x] Checkpoint heat escalation
- [ ] Character target objective
- [ ] Mixed on-foot + vehicle objective chain

## Phase 5 — Full level slice

- [x] City-sector content file (`data/city_sector.json`)
- [x] 5,200 × 3,400 authored sector
- [x] Central / Market West / Warehouse Row / Downtown identities
- [x] Parking lots, alleys, and shortcuts
- [x] Persistent campaign checkpoint, score, multiplier, best score, and unlock state
- [x] Level-completion / Downtown unlock flow
- [x] Minimap + navigation objective marker
- [x] Browser front-end entry screen
- [x] Advanced post-clear mission unlock
- [ ] Mission briefing/menu polish
- [ ] Audio pass
- [ ] Additional chained missions
- [ ] Second authored sector

## Build 12 chained mission rule

`CROSSTOWN` is the first advanced post-clear job. It uses one mission state with several ordered checkpoints rather than separate mission entries. The target vehicle must remain alive, the timer persists across every stage, and the first two checkpoint captures raise wanted heat. Minimap/world navigation advances to the next checkpoint immediately after each capture.

## Persistence rule

Only stable progression is saved: score, multiplier, selected/next campaign mission, best score, and unlock state. Active mission entities, checkpoint stage, and timers intentionally restart from the latest safe mission checkpoint.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
