# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 8 — mini campaign

The prototype now has a three-mission replayable campaign layered on top of the driving, traffic, pedestrian, combat, wanted, police, lives, bribe, and respray systems.

### Mission 1 — HOT PROPERTY
- touch the blue phone near spawn
- steal the marked teal sedan
- deliver it to the yellow bay
- slow below the delivery threshold to finish

### Mission 2 — SHORT FUSE
- touch the phone again
- destroy the marked orange car before the 35-second timer expires
- the mission grants enough pistol ammo to make the objective immediately playable
- destroying the target also creates police heat

### Mission 3 — CLEAN BREAK
- touch the phone again
- the mission immediately raises the player to three wanted heads
- clear every wanted head before the 45-second timer expires
- bribes, distance, and the respray bay all work as escape tools

Successful missions award `base reward × multiplier`. The multiplier rises after each success up to x5. The mini campaign loops after mission 3 while score and multiplier remain active for the current run. The current level target is **5,000 points**.

Mission definitions live in `data/missions.json`, so additional mission types and campaign sequences can be added without embedding their coordinates/rewards directly in the city scene.

## Engine

Godot 4.x

## Run locally

1. Install Godot 4.x.
2. Clone this repository.
3. Open `project.godot`.
4. Press **F6/F5**.

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **R** — reset

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build uses the same clean-room placeholder presentation and mirrors the current gameplay systems. The first visit may show raw.githack's one-time confirmation page.

## Development order

1. Driving + camera + collisions
2. Traffic + pedestrians
3. Damage + weapons + pickups
4. Wanted/police loop
5. Arrest/death + escape tools
6. Mission state machine
7. Mini campaign, scoring, timer objectives
8. Full level progression / save state / content pipeline

See `docs/BUILD_PLAN.md` for the implementation checklist.
