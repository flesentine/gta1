# GTA1 Remake Prototype

A from-scratch, top-down crime-sandbox prototype inspired by the gameplay structure of the original 1997 Grand Theft Auto.

This repository uses original placeholder code/art and does **not** include extracted Rockstar/DMA maps, sprites, audio, dialogue, mission text, logos, or other copyrighted game data.

## Build 17 — branching mission logic

Build 17 keeps the complete Build 16 living-city systems, entity cleanup, six previous missions, four vehicle classes, procedural audio, HUD polish, minimap/navigation, persistent progression, police/wanted loop, combat, traffic, pedestrians, bribes, and respray.

### New mission — CROSSROADS

CROSSROADS is the first mission where a player choice changes the remaining objective path.

1. steal the marked orange runner car in Central
2. drive south to the route split
3. choose **GREEN / QUIET** or **RED / HOT** by driving through one of the two route gates below the speed threshold
4. the minimap and world markers immediately switch to the selected branch

#### Green / quiet route

- deliver the runner to Warehouse Row
- no extra forced police escalation from the branch
- mission completes on delivery
- reward: **4,500 × multiplier**

#### Red / hot route

- immediately escalate to **3 wanted heads**
- deliver the runner to a different Downtown lot
- delivery reasserts the three-head response
- lose all police heat after the drop to finish
- reward: **6,500 × multiplier** (4,500 base + 2,000 hot-route bonus)

CROSSROADS has a **105-second** overall timer. Both choice gates are visible simultaneously in the world and on the minimap before the player commits.

### Mission terminal

Seven jobs are now available across progression:

1. **HOT PROPERTY** — steal + deliver
2. **SHORT FUSE** — timed destruction
3. **CLEAN BREAK** — getaway / clear heat
4. **CROSSTOWN** — three-stage courier checkpoint run
5. **DEAD DROP** — drive + on-foot package pickup + police escape
6. **RED FLAG** — moving character target + police escape
7. **CROSSROADS** — branching quiet/hot delivery

The first three form the core level path. Clearing CLEAN BREAK at the score target unlocks all four post-clear jobs. Keys **1–7** select unlocked jobs.

### Build 16 living-city systems retained

- completed/failed mission vehicles retire safely instead of accumulating forever
- active mission and player vehicles are protected from cleanup
- distant wrecks and abandoned stolen vehicles eventually despawn
- civilian traffic replenishes away from the player
- traffic paces vehicles ahead instead of constantly rear-ending them
- civilian pedestrian archetypes: Commuter, Cautious, Stroller, and Jogger
- live traffic/pedestrian counts in the lower HUD

## Validation

- `web/game17.js` passes `node --check`
- `web/branch17_runtime.js` passes `node --check`
- Build 17 loader anchor is based on the committed Build 16 runtime chain
- new Build 17 Godot scripts and scene passed delimiter sanity checks
- Godot runtime was not executed in this environment because a Godot binary is not installed

## Engine

Godot 4.x

## Controls

- **WASD / Arrow keys** — move on foot / drive
- **E** — enter or exit a nearby vehicle
- **Space / F** — fire pistol while on foot
- **M** — toggle minimap
- **Blue phone** — open mission terminal
- **1–7** — select an unlocked mission
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
14. Character-target/combat mission
15. Population behavior + entity cleanup
16. Branching mission logic
17. Second authored sector / stronger intersection behavior

See `docs/BUILD_PLAN.md` for the implementation checklist.
