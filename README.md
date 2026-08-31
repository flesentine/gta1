# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original clean-room code and original placeholder/generated art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 30 — ImageGen bitmap graphics

Build 30 is a browser visual-conversion build. All Build 29 gameplay remains: the complete three-sector world, 18 jobs, Chapter One, armed-hostile cover AI, pistol / shotgun / SMG combat, traffic simulation, level-4 police tactics, mission recovery, branching objectives, vehicle classes, procedural audio, persistence, minimap/navigation, cleanup/repopulation, bribes, and respray.

The difference is rendering: major browser-world graphics are no longer drawn primarily as flat procedural canvas rectangles and ellipses.

### Generated bitmap atlas

Build 30 uses an original ImageGen-generated art sheet that was cropped into a compact runtime atlas and then quantized to a VGA-like palette for shipping.

`web/assets/build30/bitmap_atlas.png` contains source regions for civilian and police vehicles, pedestrians and armed hostiles, weapon pickups, road/sidewalk/rooftop textures, explosions, smoke, sparks, blood, skid marks, barricades and airfield dressing.

`web/assets/build30/atlas.json` contains the exact source rectangles used by the browser renderer.

The reusable generation brief is committed at `docs/BUILD30_IMAGEGEN_PROMPT.md` so later art passes can regenerate a cleaner or larger atlas without changing gameplay code.

### Bitmap renderer

`web/bitmap30_runtime.js` replaces the main browser draw functions after the Build 29 gameplay stack has loaded:

- `drawWorld()` — bitmap road, sidewalk, lot, alley and rooftop surfaces
- `drawCar()` — civilian vehicle sprites while retaining class-specific physics/HP
- `drawCop()` — police/tactical vehicle sprites
- `drawPed()` — civilian, target and hostile sprites
- `drawPlayer()` — player bitmap sprite
- `drawPickup()` — bitmap weapon pickups
- `drawFx()` — bitmap smoke, impact sparks, explosions and skid feedback

Mission rings, traffic-light state and other gameplay-aligned markers intentionally remain geometric overlays so objective readability is not tied to an art asset.

### Safe fallback

The bitmap art layer is optional at runtime. `game30.js` attempts to preload the atlas and its JSON map. If either fails, Build 30 keeps running and the renderer calls the existing Build 29 procedural draw functions instead of presenting a blank world.

### Scope

Build 30 specifically replaces **browser Canvas graphics**. The Godot gameplay implementation remains functionally at the Build 29 system state for this pass; Godot bitmap-art parity can be done after the browser art direction is approved.

## Current missions

Build 28's base campaign contains 17 missions. Build 29/30 layer CROSSFIRE on top for **18 playable jobs**.

Chapter One remains **AIRMAIL → LOCKDOWN → RUNWAY RAID → THREE FRONTS → CROSSFIRE**.

## Browser runtime

Build 30 preserves the flat architecture introduced in Build 28:

- raw `game8.js` engine core
- authored city / sector / mission JSON
- explicit Build 28 compatibility modules
- one ordered shared-scope manifest through `combat29_runtime.js`
- final `bitmap30_runtime.js` renderer layer
- browser-time flattened-source syntax validation before execution

Historical loaders remain only for older pinned builds.

## Validation

- `web/runtime30_manifest.json` parses as JSON
- `web/assets/build30/atlas.json` parses as JSON
- `web/game30.js` passes `node --check`
- `web/runtime30_bundle.js` passes `node --check`
- `web/bitmap30_runtime.js` passes `node --check`
- shipped bitmap atlas is a palette-quantized PNG
- Build 30 preserves explicit fallback to the Build 29 procedural renderer if bitmap loading fails
- no real browser runtime smoke test was executed in this environment
- Godot runtime was not executed because a Godot binary is not installed

## Engine

Godot 4.x + browser Canvas preview

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
