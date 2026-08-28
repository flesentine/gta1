# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 9 — persistent level progression

Build 9 turns the Build 8 three-mission campaign into a persistent level loop.

### Campaign

1. **HOT PROPERTY** — steal the marked teal sedan and deliver it to the yellow bay.
2. **SHORT FUSE** — destroy the marked orange car before the 35-second timer expires.
3. **CLEAN BREAK** — start at three wanted heads and clear all heat before the 45-second timer expires.

Successful missions still award `base reward × multiplier`, with the multiplier rising up to x5.

### New in Build 9

- mission progress checkpoints after each stable mission transition
- persistent **score**
- persistent **multiplier**
- persistent **next campaign mission**
- persistent **best score**
- **5,000-point level target** now produces a real level-complete state
- completing the campaign above the target unlocks **DOWNTOWN ACCESS**
- first unlock displays a level-completion screen
- Godot persistence uses `user://gta1_build9_progress.json`
- browser persistence uses `localStorage`
- browser **R** resets the current world but keeps progression
- browser **Shift+R** deliberately clears saved progression
- mid-mission cars/timers are not serialized; reloads resume from the last safe checkpoint

Mission definitions remain data-driven in `data/missions.json`.

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
- **R** — reset the current scene/world
- **Shift+R** — browser only: clear Build 9 saved progression

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
8. Persistent level progression and unlock state
9. Larger authored city sector / content pipeline
10. HUD, menus, audio, and broader mission variety

See `docs/BUILD_PLAN.md` for the implementation checklist.
