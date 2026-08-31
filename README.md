# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 29 — armed hostiles + persistent Chapter One

Build 29 retains the complete three-sector world, flat Build 28 browser runtime, pistol / shotgun / SMG combat, level-4 police tactics, traffic simulation, mission recovery, branching objectives, vehicle classes, procedural audio, minimap/navigation, persistence, cleanup/repopulation, bribes, and respray.

### Armed hostile AI

Civilians are no longer the only on-foot NPC archetype.

Build 29 adds mission hostiles that:

- carry visible firearms
- advance when the player is far away
- stop and fire when they have line of sight
- react to taking damage by breaking toward authored cover points
- favor cover when wounded or when the player gets too close
- damage the player's current vehicle if the player stays in a car
- strip a separate four-point combat armor buffer while the player is on foot
- visibly show a cover-state arc while relocating

### New mission — CROSSFIRE

CROSSFIRE is advanced job #18.

1. reach the Downtown staging point
2. receive SMG ammunition and combat armor
3. clear five armed hostiles positioned around Downtown blocks
4. hostiles advance, fire, and retreat toward cover under pressure
5. clearing the group forces wanted level 4
6. survive the pursuit and lose all heat

Timer: **180 seconds**.

Base reward: **16,500 × multiplier**.

Build 29 adds CROSSFIRE through `data/build29_campaign.json` instead of rewriting the Build 28 base mission file.

### Chapter One — COAST TO COAST

Build 29 introduces the first persistent multi-mission chapter above the individual job layer.

Chapter One sequence:

1. **AIRMAIL**
2. **LOCKDOWN**
3. **RUNWAY RAID**
4. **THREE FRONTS**
5. **CROSSFIRE**

Chapter progress is stored separately from the normal Build 9-compatible score/progression save. Completing a stage advances the chapter checkpoint. Failing a stage keeps that chapter checkpoint so the same stage can restart after the mission cooldown. Selecting a normal standalone job suspends the chapter run.

The mission terminal includes a Chapter One control after the core level is cleared. In the browser, **`,`** starts or resumes Chapter One; **`;`** selects CROSSFIRE.

## Current missions

Build 28's base campaign contains 17 missions. Build 29 layers CROSSFIRE on top for **18 playable jobs**:

1. HOT PROPERTY
2. SHORT FUSE
3. CLEAN BREAK
4. CROSSTOWN
5. DEAD DROP
6. RED FLAG
7. CROSSROADS
8. EASTBOUND
9. NIGHT SHIFT
10. GREEN WAVE
11. PERFECT LINE
12. HOT SWAP
13. TWIN STRIKE
14. AIRMAIL
15. LOCKDOWN
16. RUNWAY RAID
17. THREE FRONTS
18. CROSSFIRE

## Browser runtime

Build 29 preserves the Build 28 flat runtime architecture:

- raw `game8.js` engine core
- authored city / sector / mission JSON
- explicit Build 28 compatibility modules replacing the old Build 9–13 patch responsibilities
- one ordered shared-scope manifest through `combat29_runtime.js`
- browser-time syntax validation before the flattened runtime executes

Historical `game9.js` through `game27.js` files remain in the repository only so older pinned builds continue working.

## Validation

- `data/build29_campaign.json` parses as JSON
- `web/runtime29_manifest.json` parses as JSON
- `web/game29.js` passes `node --check`
- `web/runtime29_bundle.js` passes `node --check`
- `web/combat29_runtime.js` passes `node --check`
- new Build 29 Godot scripts and `scenes/main.tscn` passed delimiter/structure sanity checks
- no real browser runtime smoke test was executed in this environment
- Godot runtime was not executed because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire current weapon while on foot
- **Q** — cycle owned weapons
- **M** — toggle minimap
- **Blue phone** — open mission terminal / Chapter One
- **;** — select CROSSFIRE in the mission terminal
- **,** — start/resume Chapter One in the mission terminal
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear normal saved progression

## Browser preview

https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html
