# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original clean-room code and original placeholder/generated art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 30 — sliced ImageGen bitmap graphics

Build 30 is a browser visual-conversion build. All Build 29 gameplay remains: the complete three-sector world, 18 jobs, Chapter One, armed-hostile cover AI, pistol / shotgun / SMG combat, traffic simulation, level-4 police tactics, mission recovery, branching objectives, vehicle classes, procedural audio, persistence, minimap/navigation, cleanup/repopulation, bribes, and respray.

The difference is rendering: major browser-world graphics are replaced by original generated bitmap art instead of the old flat procedural Canvas shapes.

### Sliced runtime atlas

Two original transparent ImageGen sheets were sliced, trimmed and repacked into a compact 383×176 transparent palette atlas with 48 named regions for vehicles, police/tactical units, pedestrians, hostiles, the player, weapons, roads, intersections, alleys, sidewalks, roofs, grass, Airfield surfaces, explosions, smoke, blood, sparks and skid marks.

`web/bitmap30_sliced_assets.js` embeds the PNG plus the exact crop map. `web/bitmap30_runtime.js` replaces the browser draw functions while retaining the existing gameplay geometry and collision.

### Decode fix

The first Build 30 cut could remain on the procedural fallback because the renderer could initialize before the embedded PNG was reliably decoded. The current build fixes that path explicitly:

- `bitmap30_decode_fix.js` converts the embedded PNG bytes to a Blob, decodes them with `createImageBitmap()`, and draws the result into an off-screen Canvas.
- `runtime30_bundle.js` now waits for bitmap preparation before evaluating `bitmap30_runtime.js`.
- `bitmap30_ready_fix.js` recognizes the prepared Canvas atlas as immediately ready.
- if decode still fails on a browser, the old procedural renderer remains available as a safe fallback instead of producing a blank game.

Mission rings, traffic-light state, lane guides and other gameplay-aligned markers intentionally remain geometric overlays for readability.

### Scope

Build 30 replaces **browser Canvas graphics**. Godot gameplay remains functionally at the Build 29 system state for this pass; Godot bitmap-art parity can follow after the browser art direction is approved.

## Current missions

Build 28's base campaign contains 17 missions. Build 29/30 layer CROSSFIRE on top for **18 playable jobs**.

Chapter One remains **AIRMAIL → LOCKDOWN → RUNWAY RAID → THREE FRONTS → CROSSFIRE**.

## Browser runtime

Build 30 preserves the flat architecture introduced in Build 28:

- raw `game8.js` engine core
- authored city / sector / mission JSON
- explicit Build 28 compatibility modules
- one ordered shared-scope runtime stack through `combat29_runtime.js`
- sliced bitmap asset module
- explicit bitmap decode/preparation stage
- final bitmap renderer layer
- browser-time flattened-source syntax validation before execution

Historical loaders remain only for older pinned builds.

## Validation

- `web/runtime30_manifest.json` parses as JSON
- `web/runtime30_bundle.js` passes `node --check`
- `web/bitmap30_decode_fix.js` passes `node --check`
- `web/bitmap30_ready_fix.js` passes `node --check`
- `web/bitmap30_runtime.js` passed its prior `node --check`
- embedded atlas is a transparent 383×176 palette PNG with 48 named regions
- renderer retains the procedural fallback if bitmap preparation fails
- a full browser navigation smoke test cannot be executed in this environment because the managed Chromium build blocks local/external navigation
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
