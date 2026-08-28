# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 11 — navigation + mission terminal

Build 11 makes the expanded Build 10 city easier to play and turns the blue phone into a mission-selection terminal.

### Navigation

- live minimap of the authored 5,200 × 3,400 city sector
- road/building/parking-lot overview
- player position
- police positions
- active mission objective marker
- objective label + approximate distance
- **M** toggles the minimap
- current district remains visible while driving around Central, Market West, Warehouse Row, and Downtown

### Mission terminal

Walk to the blue phone while on foot to open the mission terminal instead of automatically starting the next job.

- **HOT PROPERTY** is available on a fresh save
- completing it unlocks **SHORT FUSE**
- further progress unlocks **CLEAN BREAK**
- cleared saves can replay any mission
- keyboard shortcuts **1–3** select unlocked missions in the browser/Godot terminal
- **Esc** closes the selector
- selecting a mission becomes the new stable progression checkpoint

The existing scoring, multiplier, best score, level target, Downtown unlock, police/wanted loop, combat, traffic, pedestrians, bribes, respray, and persistent Build 9 save data are retained.

### Browser front end

The no-install browser build now opens with a compact Build 11 city-sector screen showing best score, unlocked mission count, and navigation controls before entering the city.

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
- **1–3** — select an unlocked mission while terminal is open
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
11. Chained mission objectives, audio, and HUD/menu polish

See `docs/BUILD_PLAN.md` for the implementation checklist.
