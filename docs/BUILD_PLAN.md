# Build Plan

## Guiding rule

Prove the core GTA 1 loop in a tiny clean-room test city before building full content.

## Phase 1 — Driving slice

- [x] Godot project boots into a top-down scene
- [x] On-foot movement
- [x] Enter/exit one vehicle
- [x] Arcade acceleration, braking, reverse, and steering
- [x] Building/world collision
- [x] Speed-sensitive camera zoom
- [x] Placeholder procedural city blocks/roads
- [ ] Tune vehicle feel against reference gameplay
- [ ] Add multiple vehicle definitions and spawn points
- [ ] Add skid/impact feedback

## Phase 2 — Living city

- [ ] Road graph
- [ ] Civilian traffic spawning and lane following
- [ ] Pedestrian spawning and roaming
- [ ] Panic/flee response
- [ ] Entity pooling/despawn rules
- [ ] Vehicle health, smoke, fire, explosion

## Phase 3 — Crime loop

- [ ] Weapon framework
- [ ] Pistol prototype
- [ ] Ammo/pickup framework
- [ ] Crime event bus
- [ ] Wanted stages 0–4
- [ ] Police vehicle/officer spawning
- [ ] Chase/intercept behavior
- [ ] Arrest/death/respawn
- [ ] Police bribe pickup
- [ ] Respray garage

## Phase 4 — Mission loop

- [ ] MissionDirector state machine
- [ ] Phone/start trigger
- [ ] Go-to objective
- [ ] Enter/steal vehicle objective
- [ ] Destroy/kill target objective
- [ ] Delivery objective
- [ ] Timer and failure state
- [ ] Score reward
- [ ] Score multiplier increase
- [ ] One complete replayable mission

## Phase 5 — Full level slice

- [ ] Replace procedural test layout with a content pipeline
- [ ] Mission/pickup/garage markers stored outside scene code
- [ ] Level target score and completion flow
- [ ] Save/load campaign progress
- [ ] HUD/menu/audio pass

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. If the project later targets a public release without an IP license, use original maps, names, art, missions, dialogue, audio, and branding.
