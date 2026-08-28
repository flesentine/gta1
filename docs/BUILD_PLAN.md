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
- [x] Add multiple vehicle spawn points
- [ ] Add skid/impact feedback

## Phase 2 — Living city

- [x] Simple road-route graph
- [x] Civilian traffic spawning and lane following
- [x] Pedestrian spawning and roaming
- [x] Panic/flee response
- [ ] Entity pooling/despawn rules
- [x] Vehicle health, smoke, fire, explosion/burnout state

## Phase 3 — Crime loop

- [x] Weapon framework
- [x] Pistol prototype
- [x] Ammo/pickup framework
- [x] Crime-to-wanted hooks
- [x] Wanted stages 0–4
- [x] Police vehicle spawning
- [x] Chase/ram behavior
- [x] Arrest/death/respawn
- [x] Police bribe pickup
- [x] Respray garage

## Phase 4 — Mission loop

- [x] MissionDirector state machine
- [x] Phone/start trigger
- [x] Go-to objective
- [x] Enter/steal vehicle objective
- [ ] Destroy/kill target objective
- [x] Delivery objective
- [x] Failure state
- [x] Score reward
- [x] Score multiplier increase
- [x] One complete replayable mission
- [ ] Timed objective support

## Phase 5 — Full level slice

- [ ] Replace procedural test layout with a content pipeline
- [x] Mission definitions stored outside scene code
- [ ] Pickup/garage definitions stored outside scene code
- [ ] Level target score and completion flow
- [ ] Save/load campaign progress
- [ ] HUD/menu/audio pass
- [ ] Multiple linked missions

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. If the project later targets a public release without an IP license, use original maps, names, art, missions, dialogue, audio, and branding.
