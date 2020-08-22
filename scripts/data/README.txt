README for /data directory
==========================

The following store static (strings and numbers) data:
    IMAGES.json
    SOUNDS.json

The following store dynamic (JavaScript code) data:
    OBJECTS.json

The /data/dynamic directory stores files that setup various
objects in the following format:
    <name>.dyd.js

Example of a _.dyd.js file, "grid.dyd.js":

BACKGROUND = {img:'ocean.png'};
TILE = {img:'rocks.png'};
GRID = {tile: TILE, bg: BACKGROUND};


=========================

Specifying Joints for Sprites
=========================

Look into 'Joint-Names.txt'
