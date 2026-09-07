# Build 30 ImageGen art prompt

Build 30 moves the browser renderer from procedural canvas primitives to original bitmap art. The generated art must remain clean-room: do not imitate or reproduce GTA maps, sprites, logos, UI art, characters, mission text, or any other copyrighted game assets.

## Master art direction

> Create an original top-down bitmap-art asset set for a fictional 1990s crime-sandbox driving game. Strict orthographic overhead camera, no perspective tilt, no isometric angle. Gritty but readable late-1990s PC/VGA feel, limited 128–256 color palette, crisp pixel clusters, subtle hand-painted texture, strong silhouettes at small sizes, consistent lighting from the upper left, transparent background for sprites. Everything must be newly designed and generic: no real brands, no recognizable copyrighted logos, no copied GTA assets, no text baked into gameplay sprites. Keep every asset separated by generous transparent padding so it can be cropped into a sprite atlas.

## Vehicle / character atlas prompt

> On one transparent square sprite sheet, create separated top-down sprites for: five civilian cars in different colors and body shapes; one compact car; one sedan; one muscle car; one cargo van; one box truck; two distinct police cruisers; one heavy tactical van; eight varied civilian pedestrians; three armed hostile pedestrians; one police officer; one tactical officer; one player-character pedestrian; a pistol pickup; shotgun pickup; compact SMG pickup; ammo box; shotgun shells; police bribe pickup. All vehicles point straight upward. All standing characters face upward. No shadows extending outside each sprite's local footprint. No labels or UI text. Crisp bitmap/pixel-art rendering.

## Environment atlas prompt

> Create a second original top-down bitmap tile sheet, orthographic and seamless where appropriate: asphalt road straight, four-way road intersection, crosswalk, parking-lot concrete, cracked service alley, sidewalk slabs, three rooftop textures, grass/planter texture, hedge/trees, airfield tarmac, helipad marking, runway paint, traffic cone, striped barricade, tire pile, skid marks, muzzle flash, sparks, small explosion, large explosion, four smoke frames, blood/splatter decal. No logos and no words. Keep effects on transparent background and tile surfaces square/rectangular with clean edges.

## Front-end splash prompt

> Create an original top-down bitmap-art city action scene using the same visual language as the sprite atlas: downtown intersection, civilian traffic, pedestrians, police pursuit, generic storefronts, Harbor industrial blocks and an Airfield edge. Leave the center clear enough for a dark translucent menu card. No copyrighted branding, no game logo, no baked UI, no readable signage except generic invented words.

## Export rules

- PNG for sprite/texture atlases.
- Transparent background for isolated sprites/effects.
- Keep source art at 2x–4x the final in-game size; browser scales down.
- Quantize the shipped atlas to a compact VGA-like palette after generation.
- Keep an atlas JSON file with exact source rectangles.
- The runtime must fall back to the procedural renderer if the bitmap atlas cannot load.
