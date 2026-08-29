# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 12 — chained mission objectives

Build 12 keeps the Build 11 minimap and mission terminal, then adds the first mission with several objectives inside one continuous job.

### New mission — CROSSTOWN

CROSSTOWN unlocks after the core level has been cleared.

1. steal the marked green courier car from Downtown
2. reach checkpoint 1 on the north cross-town road
3. reach checkpoint 2 in Central
4. reach checkpoint 3 near Warehouse Row before the 80-second timer expires

The driver must slow below the checkpoint capture speed inside each marker. The first two checkpoints each add police heat, so the route gets progressively more dangerous instead of behaving like three unrelated delivery zones.

CROSSTOWN has a **3,000 point base reward**, which is still multiplied by the current score multiplier.

### Mission terminal

The terminal now supports four jobs:

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear wanted
4. **CROSSTOWN** — three-stage courier run

Use **1–4** while the terminal is open. CROSSTOWN remains locked until the level-complete state has been earned; cleared saves can replay all four jobs.

### Navigation

The minimap and world markers understand each chained CROSSTOWN stage. The active checkpoint number and distance update automatically when a checkpoint is captured.

The existing 5,200 × 3,400 authored city, district identities, traffic, pedestrians, combat, wanted/police system, BUSTED/WASTED loop, bribes, respray, score, multiplier, best score, persistent checkpoints, and Downtown unlock remain intact.

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
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–4** — select an unlocked mission while terminal is open
- **Esc** — close mission terminal
- **R** — reset the current world
- **Shift+R** — browser only: clear saved progression

## Browser preview

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build mirrors the clean-room gameplay prototype. The first visit may show raw.githack's one-time confirmation page.

## Development order

1. Driving + camera + collisions
2. Traffic + pedestrians
3. Damage + weapons + pickups
4. Wanted/police loop
5. Arrest/death + escape tools
6. Mission state machine
7. Mini campaign, scoring, timer objectives
8. Persistent level progression and unlock state
9. Authored city sector / content pipeline
10. Navigation + mission selection/front-end flow
11. Multi-stage chained mission objectives
12. Audio, HUD/menu polish, character-target missions, and additional content

See `docs/BUILD_PLAN.md` for the implementation checklist.
