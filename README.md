# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository starts with a clean-room technical foundation. It does **not** include Rockstar/DMA game assets, maps, audio, mission text, or other extracted copyrighted content.

## Current goal

Build a small playable vertical slice before attempting a full city:

- top-down player movement
- enter/exit vehicles
- arcade vehicle handling
- speed-sensitive camera zoom
- moving traffic
- sidewalk pedestrians with panic reactions
- pistol/ammo pickups and combat
- vehicle damage/burnout states
- four-stage wanted system and police pursuit
- arrest/death/lives loop
- police bribes and respray escape mechanics
- later: missions, score, multiplier, and progression

## Engine

Godot 4.x

## Run

1. Install Godot 4.x.
2. Clone this repository.
3. Open `project.godot` in Godot.
4. Press **F6/F5** to run.

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit the nearby vehicle
- **Space / F** — fire pistol while on foot
- **R** — reset the prototype

## Development order

1. Driving + camera + collisions
2. Traffic + pedestrians
3. Damage + weapons + pickups
4. Wanted/police loop
5. Arrest/death + escape tools
6. Mission state machine
7. First complete level slice

See `docs/BUILD_PLAN.md` for the implementation checklist.

## Play in your browser

The latest development build has a no-install browser preview:

**https://raw.githack.com/flesentine/gta1/bootstrap/playable-slice/web/index.html**

The browser build is intentionally asset-free placeholder art. The Godot project remains the main implementation. The first visit may show raw.githack's one-time confirmation screen before opening the HTML preview.

### Build 6

- everything from Build 5: traffic, pedestrians, pistol combat, vehicle damage, four wanted levels, and police pursuit
- **3-life system** with HUD counter
- police can **BUST** the player on foot when they maintain close contact
- high-speed police impacts can **WASTE** the player
- losing a life clears wanted level, removes the pistol/ammo, and respawns the player
- after all three lives are lost, a short **GAME OVER** state resets the prototype
- green **police bribe** pickups remove one wanted head when collected on foot
- four bribe pickups are distributed around the test city
- visible pink **RES-PRAY** bay on the western road
- enter the respray bay in a car and slow below the threshold to clear the entire wanted level
- respray immediately dismisses pursuing police
- bust-progress feedback appears in the HUD as police close in
- desktop keyboard and mobile touch controls
