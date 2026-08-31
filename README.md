# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original clean-room code and original placeholder/generated art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 30 — sliced ImageGen bitmap graphics

Build 30 is a browser visual-conversion build. All Build 29 gameplay remains: the complete three-sector world, 18 jobs, Chapter One, armed-hostile cover AI, pistol / shotgun / SMG combat, traffic simulation, level-4 police tactics, mission recovery, branching objectives, vehicle classes, procedural audio, persistence, minimap/navigation, cleanup/repopulation, bribes, and respray.

The difference is rendering: major browser-world graphics are no longer drawn primarily as flat procedural Canvas rectangles and ellipses.

### Sliced generated art

Two original transparent ImageGen art sheets were cut into gameplay-sized crops and repacked into a compact palette-reduced atlas. The live atlas exposes **48 named regions** covering:

- civilian cars, police cruisers and a tactical van
- eight civilian pedestrians, three armed hostiles, police/SWAT and a dedicated player sprite
- pistol, shotgun and SMG pickups
- roads, intersections, alleys, sidewalks, parking surfaces, three roofs, grass and Airfield/helipad/runway surfaces
- explosions, four smoke frames, blood, sparks and skid marks

The optimized atlas is embedded in `web/bitmap30_sliced_assets.js` as a transparent PNG data URI together with its exact crop map. This avoids a second binary fetch and guarantees the crop metadata and bitmap always ship together.

The earlier `web/assets/build30/bitmap_atlas.png` / `atlas.json` files remain as a historical Build 30 art pass, but the live Build 30 boot no longer depends on them.

The reusable clean-room generation brief is committed at `docs/BUILD30_IMAGEGEN_PROMPT.md`.

### Bitmap renderer

`web/bitmap30_runtime.js` replaces the main browser draw functions after the Build 29 gameplay stack has loaded:

- `drawWorld()` — sliced grass, road/intersection, alley, lot, sidewalk, rooftop and Airfield surfaces
- `drawCar()` — civilian vehicle sprites while retaining class-specific physics/HP
- `drawCop()` — police/tactical vehicle sprites
- `drawPed()` — civilian, mission-target and hostile sprites
- `drawPlayer()` — dedicated player bitmap sprite
- `drawPickup()` — bitmap weapon pickups where a generated slice exists
- `drawFx()` — bitmap smoke, sparks, explosions, blood and skid feedback

Mission rings, traffic-light state, lane-center guides and other gameplay-aligned markers intentionally remain geometric overlays so objective readability is not tied to an art asset.

### Safe fallback

`bitmap30_sliced_assets.js` loads before `bitmap30_runtime.js`. The renderer waits for the embedded PNG to decode; until it is ready—or if it ever fails—the existing Build 29 procedural draw functions remain active instead of presenting a blank world.

### Scope

Build 30 specifically replaces **browser Canvas graphics**. The Godot gameplay implementation remains functionally at the Build 29 system state for this pass; Godot bitmap-art parity can follow after the browser art direction is approved.

## Current missions

Build 28's base campaign contains 17 missions. Build 29/30 layer CROSSFIRE on top for **18 playable jobs**.

Chapter One remains **AIRMAIL → LOCKDOWN → RUNWAY RAID → THREE FRONTS → CROSSFIRE**.

## Browser runtime

Build 30 preserves the flat architecture introduced in Build 28:

- raw `game8.js` engine core
- authored city / sector / mission JSON
- explicit Build 28 compatibility modules
- one ordered shared-scope manifest through `combat29_runtime.js`
- `bitmap30_sliced_assets.js` — generated atlas + exact crop table
- `bitmap30_runtime.js` — final bitmap renderer layer
- browser-time flattened-source syntax validation before execution

Historical loaders remain only for older pinned builds.

## Validation

- `web/runtime30_manifest.json` parses as JSON and loads the sliced asset module before the renderer
- `web/game30.js` passes `node --check`
- `web/runtime30_bundle.js` passes `node --check`
- `web/bitmap30_sliced_assets.js` passes `node --check`
- `web/bitmap30_runtime.js` passes `node --check`
- the embedded source is a transparent, palette-reduced PNG atlas with 48 named crops
- Build 30 preserves explicit fallback to the Build 29 procedural renderer while the bitmap is unavailable
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
