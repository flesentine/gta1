# Build Plan

## Guiding rule

Prove the core GTA 1 loop in a clean-room playable sector before scaling content.

## Phase 1 — Driving slice

- [x] Godot project boots into a top-down scene
- [x] On-foot movement
- [x] Enter/exit vehicles
- [x] Arcade acceleration, braking, reverse, and steering
- [x] Building/world collision
- [x] Speed-sensitive camera zoom
- [x] Placeholder procedural city foundation
- [ ] Tune vehicle feel against reference gameplay
- [ ] Add broader vehicle-definition variety
- [ ] Add skid/impact feedback

## Phase 2 — Living city

- [x] Basic traffic route graph
- [x] Civilian traffic spawning and route following
- [x] Pedestrian spawning and roaming
- [x] Panic/flee response
- [x] Outer-neighborhood population layer
- [ ] Entity pooling/despawn rules
- [x] Vehicle health, smoke, fire/burnout state

## Phase 3 — Crime loop

- [x] Weapon framework
- [x] Pistol prototype
- [x] Ammo/pickup framework
- [x] Crime events raise wanted state
- [x] Wanted stages 0–4
- [x] Police vehicle spawning
- [x] Chase/intercept behavior
- [x] Arrest/death/respawn
- [x] Police bribe pickup
- [x] Respray garage

## Phase 4 — Mission loop

- [x] Data-driven MissionDirector state machine
- [x] Phone/start trigger
- [x] Enter/steal vehicle objective
- [x] Delivery objective
- [x] Destroy-target objective
- [x] Lose-wanted / getaway objective
- [x] Mission timer and failure state
- [x] Score reward
- [x] Score multiplier increase
- [x] Three-mission replayable mini campaign
- [ ] Pedestrian/character target objective
- [ ] More objective chaining inside one mission

## Phase 5 — Full level slice

- [x] Mission coordinates/rewards stored outside scene code
- [x] Level target score displayed
- [x] Save/load campaign progress
- [x] Persistent unlock/progression state
- [x] Authored city sector stored outside scene code
- [x] Multiple neighborhood identities
- [x] Parking lots / service alleys / shortcuts
- [x] Outer traffic and pedestrian population from sector data
- [ ] Sector streaming / entity pooling
- [ ] Mission selection / campaign completion menu
- [ ] HUD/menu/audio pass
- [ ] Additional authored sector(s)

## Build 10 content pipeline

`data/city_sector.json` is the current source of truth for world bounds, road axes, building footprints, parking lots, alleys, district labels, traffic routes/spawns, pedestrian routes, and major landmarks.

The Godot `City` renderer/collision layer and `SectorPopulation` layer both read this file. The browser Build 10 loader reads the same file before patching the clean-room browser simulation.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. If the project later targets a public release without an IP license, use original maps, names, art, missions, dialogue, audio, and branding.
