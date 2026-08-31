# Build Plan

## Guiding rule

Prove the core GTA 1 loop with original clean-room content, then expand systems without coupling content coordinates directly to gameplay code.

## Phase 1 — Driving slice

- [x] Godot project boots into a top-down scene
- [x] On-foot movement
- [x] Enter/exit vehicles
- [x] Arcade acceleration, braking, reverse, steering, class feel, skid and impact feedback
- [x] Building/world collision and speed-sensitive camera zoom
- [x] Authored city roads/buildings loaded from data
- [x] Persistent tire-damage handling penalties

## Phase 2 — Living city

- [x] Traffic route graph, civilian traffic and pedestrian population
- [x] Panic/flee response and pedestrian behavior archetypes
- [x] Entity cleanup/despawn and replacement traffic
- [x] Traffic spacing, signals, two-lane offsets, safe lane changes and turn pockets
- [x] Movement-aware intersection reservations
- [x] Three-sector traffic and pedestrian population

## Phase 3 — Crime / combat loop

- [x] Pistol / ammo pickups
- [x] Shotgun / shell pickups
- [x] SMG / ammunition pickups
- [x] Weapon cycling
- [x] Multi-pellet shotgun behavior
- [x] Three-round SMG burst behavior
- [x] Armed hostile NPC archetype
- [x] Hostile advance / fire / simple cover behavior
- [x] On-foot combat armor buffer
- [x] Wanted stages 0–4
- [x] Police pursuit, predictive routing and coordinated roles
- [x] Roadblocks, spike strips and level-4 box tactics
- [ ] Additional hostile weapon archetypes
- [ ] Hostile squad coordination / suppression / flanking

## Phase 4 — Mission loop

- [x] Data-driven MissionDirector and mission-selection terminal
- [x] Steal/deliver, destruction, lose-wanted, timers and failure states
- [x] Score + multiplier rewards and mission unlock/replay flow
- [x] Chained checkpoints and mixed vehicle/on-foot objectives
- [x] Character target/combat objective
- [x] Branching route-dependent mission choice
- [x] Cross-sector, optional bonus, multi-stage swap and retry-checkpoint missions
- [x] Parallel objectives / choose-order mission
- [x] Three-sector delivery and tactical level-4 pursuit missions
- [x] Shotgun combat sweep mission
- [x] Sequential three-sector combat campaign mission
- [x] Armed hostile / cover assault mission
- [x] Persistent multi-mission Chapter One sequence
- [ ] Chapter-specific rewards / completion unlocks
- [ ] Additional campaign chapters

## Phase 5 — Full level slice

- [x] Original authored 5,200 × 3,400 city sector
- [x] Harbor East / Docklands second sector
- [x] West Ridge / Airfield third sector
- [x] Seamless ~10,800 × 3,400 world and minimap expansion
- [x] District identities, lots, alleys, shortcuts and Airfield runway
- [x] Persistent campaign checkpoint, score, multiplier, best score and unlock state
- [x] Browser front-end entry screen
- [x] Fifteen post-clear advanced jobs including Build 29 overlay content
- [x] Procedural audio and HUD/mission-state polish
- [x] Browser runtime manifest with explicit module order
- [x] Flatten browser bootstrap to raw engine core + explicit runtime modules
- [x] Flatten runtime guard blocks into a real shared lexical scope
- [x] Broader weapon/combat depth with pistol, shotgun and SMG
- [x] Additional West Ridge / Airfield mission content
- [ ] Replace legacy `game8.js` raw engine core with named production modules (`world`, `entities`, `missions`, `ui`, `audio`, `progress`)
- [ ] Real automated browser runtime smoke test
- [ ] Real Godot CI/parser/runtime validation

## Build 29 — armed hostiles + Chapter One

- adds CROSSFIRE as job #18 through `data/build29_campaign.json`
- five armed hostiles use advance / fire / cover states
- wounded hostiles prioritize authored cover points
- hostile fire damages vehicle HP or the player's separate four-point combat armor buffer
- CROSSFIRE gives SMG ammunition + armor, escalates to wanted level 4 after the hostile group is cleared, then requires a full escape
- CROSSFIRE timer: 180 seconds
- CROSSFIRE reward: 16,500 × multiplier
- adds persistent Chapter One — COAST TO COAST
- Chapter One sequence: AIRMAIL → LOCKDOWN → RUNWAY RAID → THREE FRONTS → CROSSFIRE
- chapter stage is persisted separately and retained on mission failure
- selecting a standalone mission suspends an active chapter
- `;` selects CROSSFIRE and `,` starts/resumes Chapter One
- browser flat manifest extends through `combat29_runtime.js`

## Persistence rule

Stable base progression remains Build 9-compatible: score, multiplier, selected/next mission, best score, and unlock state. Build 29 adds a separate small chapter save containing only active/stage/pending chapter state. Active world entities, hostile health/positions, weapon inventory, armor, tire damage, route choices, optional-bonus state, timers, roadblocks and spike strips are intentionally transient.

## IP boundary

Do not commit extracted GTA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data. Use original maps, names, art, missions, dialogue, audio, and branding unless an appropriate license is obtained.
