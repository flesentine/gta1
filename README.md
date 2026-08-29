# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 14 — audio, handling, and presentation polish

Build 14 keeps the complete Build 13 city, five-job mission terminal, minimap/navigation, persistent progression, police/wanted loop, combat, traffic, pedestrians, bribes, respray, CROSSTOWN, and DEAD DROP.

### Vehicle classes

Civilian and mission vehicles now rotate through four handling/visual archetypes:

- **COMPACT** — smallest, quickest steering, lightest health pool
- **SEDAN** — balanced baseline
- **MUSCLE** — fastest acceleration/top speed with heavier steering and more health
- **VAN** — largest and toughest, but slower and less agile

Vehicle body size, cabin treatment, acceleration, top speed, braking, turning, and health now differ by class. The lower HUD shows the class, speed, and HP of the current vehicle.

### Driving feedback

- visible tire-skid marks during hard high-speed steering
- collision spark feedback
- impact screen shake in the browser build
- speed-sensitive engine tone in the browser build
- collision and skid sound cues
- class-specific silhouettes instead of every civilian car sharing the same rectangle

### Procedural audio

Build 14 adds an original procedural audio pass rather than imported audio assets.

Sound cues cover:

- pistol fire
- pickups and bribes
- entering/exiting vehicles
- tire skid
- vehicle impacts
- wanted/police alert tone
- mission start
- mission completion
- mission failure / BUSTED / WASTED states

Browser audio activates after the first pointer or keyboard interaction because of normal browser autoplay restrictions.

### HUD / mission presentation

- bottom-center vehicle/on-foot status bar
- vehicle class, speed, and health readout
- stronger mission-start, mission-complete, mission-failure, and objective banners
- Build 14 mission-terminal labeling
- Build 13's five missions and navigation markers remain unchanged

### Pedestrian variety

Browser pedestrians now use several different body proportions, hair treatments, and skin-tone palettes while retaining their existing panic, roam, and knockdown behavior.

## Current missions

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape

The first three form the core level path. Clearing CLEAN BREAK at the score target unlocks CROSSTOWN and DEAD DROP. Keys **1–5** select unlocked jobs.

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–5** — select an unlocked mission
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
8. Persistent progression and unlocks
9. Authored city sector / content pipeline
10. Navigation + mission selection
11. Chained checkpoint objectives
12. Mixed vehicle/on-foot mission flow
13. Audio/HUD polish + vehicle and pedestrian variety
14. Character-target/combat missions + deeper city population

See `docs/BUILD_PLAN.md` for the implementation checklist.
