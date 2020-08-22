////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Data Loader, Images, Sounds, Audio, Objects
//  Filename:       data_loader.js
//  Date:           5/21/2019
//  Description:    game.js script dependant module to be included in main html
//                  file. Loads various types of data into the browser.
//
////////////////////////////////////////////////////////////////////////////////
//
//  Honor Pledge:
//
//  I pledge that I have neither given nor received any help on this assignment.
//
//  ibsardar
//
////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

import { Game } from './game.js';

export { DATA };

// -----------------------------------------------------------------------------
// Main data object
var DATA = {
    IMG : {}, // list of images
    SND : {}  // list of sounds
    // remaining objects will go straight into the data object
};
DATA.IMG.LOADED = false; // all images loaded indicator
DATA.SND.LOADED = false; // all sounds loaded indicator
DATA.LOADED = false; // all data loaded indicator



// -----------------------------------------------------------------------------
// images

// debug
DATA.IMG.DBG_THICK = {img:"images/thick.png", w:100, h:40}
DATA.IMG.DBG_THIN = {img:"images/thin.png", w:150, h:2}

// background
DATA.IMG.BG_01 = {img:"images/bg_geometric.jpg", w:1280, h:720}

// arrow (for debugging)
DATA.IMG.ARROW_01 = {img:'images/arrow6.png', w:34, h:34}

// tiles
DATA.IMG.TILE_00 = {img:'images/tile0.PNG', w:50, h:50}
DATA.IMG.TILE_01 = {img:'images/tile1.png', w:50, h:50}
DATA.IMG.TILE_02 = {img:'images/tile2.png', w:50, h:50}
DATA.IMG.TILE_03 = {img:'images/tile3.png', w:50, h:50}

// walls
// ...

// units
DATA.IMG.CREEP_01 = {img:'images/creep01.png', w:20, h:20}
DATA.IMG.CREEP_02 = {img:'images/creep02.png', w:20, h:20}
DATA.IMG.CREEP_03 = {img:'images/creep03.png', w:20, h:20}
DATA.IMG.TANK_01 = {img:'images/tank01.png', w:15, h:21}
DATA.IMG.TANK_02 = {img:'images/tank02.png', w:15, h:21}
DATA.IMG.TANK_03 = {img:'images/tank03.png', w:15, h:21}

// necrons
DATA.IMG.NECRON_UNIT = {img:'images/Necron/necron.png', w:8, h:9}
DATA.IMG.NECRON_GAUSS_RIFLE = {img:'images/Necron/gauss_rifle.png', w:15, h:6}

// load all images
{
    const IMAGES = Object.values(DATA.IMG);

    (function next(i=1) {
        if (i < IMAGES.length) {
            const img = new Image();
            img.addEventListener('load', function tmp() {
                next(++i);
                img.removeEventListener('load', tmp);
            });
            img.src = IMAGES[i].img;
        } else {
            console.log("Images loaded.");
            DATA.IMG.LOADED = true;
            if (DATA.SND.LOADED)
                DATA.LOADED = true;
        }
    }) ();
}



// -----------------------------------------------------------------------------
// sounds
DATA.SND.BG1 = new Howl({ src: ['audio/game_beat.wav'], volume: 1.0, loop: true });
DATA.SND.BG2 = new Howl({ src: ['audio/tron_trap.wav'], volume: 1.0, loop: true });
DATA.SND.BG3 = new Howl({ src: ['audio/wh_orks.mp3'], volume: 1.0, loop: true });
DATA.SND.START = new Howl({ src: ['audio/start.wav'], volume: 1.0 });
DATA.SND.HIT = new Howl({ src: ['audio/hit.wav'], volume: 1.0 });
DATA.SND.HURT = new Howl({ src: ['audio/hurt.wav'], volume: 1.0 });
DATA.SND.BURN = new Howl({ src: ['audio/burn.wav'], volume: 0.05 });
DATA.SND.COIN = new Howl({ src: ['audio/coin.wav'], volume: 1.0 });
DATA.SND.DESTROY = new Howl({ src: ['audio/destroy.wav'], volume: 1.0 });
DATA.SND.DIE = new Howl({ src: ['audio/die.wav'], volume: 1.0 });
DATA.SND.GUN = new Howl({ src: ['audio/gun.wav'], volume: 1.0 });
DATA.SND.LASER = new Howl({ src: ['audio/laser.wav'], volume: 1.0 });

// load all sounds
{
    const SOUNDS = Object.values(DATA.SND);

    (function next(i=1) {
        if (i < SOUNDS.length) {
            if (SOUNDS[i].state() == 'loaded') next(++i);
            else SOUNDS[i].once('load', () => next(++i));
        } else {
            console.log("Sounds loaded.");
            DATA.SND.LOADED = true;
            if (DATA.IMG.LOADED)
                DATA.LOADED = true;
        }
    }) ();
}



// -----------------------------------------------------------------------------
// other objects

// tile data
DATA.TILE_00 = {scene: Game, img_data: DATA.IMG.TILE_00, types: [0]};
DATA.TILE_01 = {scene: Game, img_data: DATA.IMG.TILE_01, types: [1]};
DATA.TILE_02 = {scene: Game, img_data: DATA.IMG.TILE_02, types: [2]};
DATA.TILE_03 = {scene: Game, img_data: DATA.IMG.TILE_03, types: [3]};

// grid translations
DATA.SCROLL = {
    buffer   : 8, 
    speed    : 3,
    controls : {
        // left: Nickel.KEYCODES.LEFTARROW,
        // up: Nickel.KEYCODES.UPARROW,
        // right: Nickel.KEYCODES.RIGHTARROW,
        // down: Nickel.KEYCODES.DOWNARROW,
        mouse: true
    } /* KEYS, mouse enables scrolling when near edges of grid */
};

// grid rotations
DATA.ROT = {
    origin   : 'mouse', /* Keywords:  mouse  center  [x, y]  */
    speed    : 1,
    controls : {
        left: Nickel.KEYCODES.LEFTARROW, 
        right: Nickel.KEYCODES.RIGHTARROW, 
        secondary: Nickel.KEYCODES.ALT
    } /* KEYS, secondary is optional */
};

// grid scaling
DATA.ZOOM = {
    origin   : 'mouse', /* Keywords:  mouse  center  [x, y]  */
    //bounds   : {'in': 4, 'out': 0.65},
    bounds   : {'in': 4, 'out': 0.65},
    speed    : 4,
    controls : true /* scroll wheel default control */
};

// grid limits
DATA.LIMIT = {
    pad_top    : 200,
    pad_left   : 200,
    pad_right  : 200,
    pad_bottom : 200
}

/********** MARYAMS JUNK
// grid translations
DATA.SCROLL = {
    buffer   : 8,
    speed    : 9,
    controls : {
        left: Nickel.KEYCODES.LEFTARROW,
        up: Nickel.KEYCODES.UPARROW,
        right: Nickel.KEYCODES.RIGHTARROW,
        down: Nickel.KEYCODES.DOWNARROW,
        //mouse: true
    } // KEYS, mouse enables scrolling when near edges of grid
};

// grid rotations
DATA.ROT = {
    origin   : 'mouse', // Keywords:  mouse  center  [x, y]
    speed    : 0,
    controls : {
        left: Nickel.KEYCODES.LEFTARROW, 
        right: Nickel.KEYCODES.RIGHTARROW, 
        secondary: Nickel.KEYCODES.ALT
    } // KEYS, secondary is optional
};

// grid scaling
DATA.ZOOM = {
    origin   : 'mouse', // Keywords:  mouse  center  [x, y]
    //bounds   : {'in': 4, 'out': 0.65},
    bounds   : {'in': 4, 'out': 1},
    speed    : 9,
    controls : true // scroll wheel default control
};

// grid limits
DATA.LIMIT = {
    pad_top    : 0,
    pad_left   : 0,
    pad_right  : 0,
    pad_bottom : 0
}
**********/

// grid navigation mesh node
DATA.NODE = {
    type     : "debug",
    spr_data : DATA.IMG.ARROW_01
};

// grid navigation mesh (2D grid structure)
DATA.NAV = {
    node_data   : DATA.NODE,
    field_list  : []
}

// grid
DATA.GRID = {
    scene               : Game,
    matrix              : /*[[1,2,3,2,3,3,2,2,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,2,3,2,0,1,3,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,1,2,0,2,2,0,1,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,2,3,2,0,1,3,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,1,2,0,2,2,0,1,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,1,2,0,2,2,0,1,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,2,3,2,0,1,3,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,1,2,0,2,2,0,1,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2],
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2]],*/
                          [[3,3,0,3,3],
                           [3,0,1,0,3],
                           [0,1,2,1,0],
                           [3,0,1,0,3],
                           [3,3,0,3,3]],
    types               : { 0:DATA.TILE_00,
                            1:DATA.TILE_01,
                            2:DATA.TILE_02,
                            3:DATA.TILE_03 },
    bg_data             : DATA.IMG.BG_01,
    scroll_data         : DATA.SCROLL,
    rotation_data       : DATA.ROT,
    zoom_data           : DATA.ZOOM,
    limit_data          : DATA.LIMIT,
    navmesh_data        : DATA.NAV
}

// Test Projectile
DATA.TESTPROJ = {
    sprite_data : DATA.IMG.CREEP_02,
    bounds : {
        left : 0, right : Game.get_w(), top : 0, bottom : Game.get_h()
    },
    script_effect : function(p) {
        //p.sprite.offset_position(0.5,0);
        //var rnd = Nickel.util.r_num(-1,1);
        //p._steering_vector = Nickel.v2d.add_s(rnd, p._steering_vector);
    },
    targets : [],
    group : 'test',
    on_create : function(p) {
        /*console.log('created test projectile');*/
        DATA.TESTPROJ.behaviors.boids.targets.push(p.sprite);
    },
    on_hit : function(p, t) {
        /*console.log('test projectile hitting target');*/
        /*p.destroy();*/
        /*t.offset_position(10,10);*/
        /*if (p.position[0] < t.get_center()[0]-200) {
            console.log(p.sprite.colliding_with(t, false));
        }*/
    },
    on_destroyed : function(p) {
        /*console.log('destroyed test projectile');*/
        var i = 0;
        while (p.sprite.get_id() != DATA.TESTPROJ.behaviors.boids.targets[i].get_id()) {
            i++;
        }
        DATA.TESTPROJ.behaviors.boids.targets.splice(i, 1);
    },
    on_delete : function(p) { /*console.log('DELETED test projectile');*/ },

    // bullet specific vars
    particle_sys : null,
    maxtime : 20000, // 20 seconds
    damage : 5,
    health : 99,
    snd_create : DATA.SND.COIN,
    snd_hit : null, //DATA.SND.HIT,
    snd_destroy : DATA.SND.DESTROY,

    // sticky bullet specific vars
    is_sticky : true,
    sticktime : 2000, // 2 seconds
    interval : 250, // 0.25 seconds
    snd_stick : DATA.SND.HIT,
    snd_interval : DATA.SND.LASER,
    on_stick : function(p, t) {
        /*console.log('bullet has stuck onto a target');
    },
    on_interval : function(p, t) { /*console.log('interval pulse...');*/ 
        if ((p._last_interval/p._interval)%2) p.sprite.set_pic(DATA.IMG.CREEP_01);
        else p.sprite.set_pic(DATA.IMG.CREEP_03);
    },

    // smart bullet specific vars
    behaviors : {
        limit : {
            min : 1,
            max : 4
        },
        flee : {
            targets : [],
            radius : 50,
            weight : 1,
            priority : null // default: closest
        },
        seek : {
            targets : [],
            radius : 1000,
            weight : 3,
            priority : null // default: closest
        },
        avoid : {
            targets : [],
            radius : 50,
            weight : 2,
            sight : 75
        },
        boids : {
            targets : [], // should continuously add & remove targets
            align_radius : 50,
            cohere_radius : 75,
            separate_radius : 20,
            boids_weight : 10,
            align_weight : 4,
            cohere_weight : 1,
            separate_weight : 4
        },
        wander : {
            weight : 1,
            smooth : 90,
            max : 5
        },
        follow : {
            path : [],
            seek_radius : 25, // radius where bullet will stop seeking a node
            arrive_radius : 400, // radius where bullet will slowing down due to arrival at a node
            weight : 0,
            patrol : true
        }
    }
}

// Test Particle
DATA.TESTPTC = {
    context                 : Game.context,
    //image                   : "some_image.ext",
    shape                   : ParticleBuilder.TYPES.RECTANGLE,
    enable_translation      : true,
    enable_rotation         : true,
    enable_scaling          : true,
    enable_transparency     : true,
    enable_fill             : false,
    enable_stroke           : false
}

// Test Particle System
DATA.TESTPS = {
    particle_data           : DATA.TESTPTC,
    scene                   : Game,
    lifetime_mseconds       : Infinity, // emit forever
    position                : [0,0],
    rotation                : 0, // experimental
    scale                   : [1,1], // experimental
    create_amount           : 3,
    //create_amount_var       : [-3,3],
    //create_amount_bounds    : [7,11],
    create_period_mseconds  : 15 // every .0? seconds
    //create_period_var       : [-3,3],
    //create_period_bounds    : [1,25]
}

// Test Particle Bullet System
DATA.TESTPBS = {
    //particle_sys : some_particle_system_object,
    particle_sys_data : DATA.TESTPS,
    script_effect : null,
    targets : [],
    group : 'test',
    damage : 10,
    health : 1,
    on_create : function(s, p) { /*console.log('PBS-PTC created');*/ },
    on_hit : function(s, p, t) { /*console.log('PBS-PTC hit!');*/ p.dead = true; },
    on_destroyed : function(s, p) { /*console.log('PBS-PTC destroyed');*/ },
    on_delete : function(s, p) { /*console.log('PBS-PTC deleted');*/ },
    snd_create : null,//DATA.SND.COIN,
    snd_hit : DATA.SND.BURN,
    snd_destroy : null,//DATA.SND.DIE,

    // Glow-specific params:
    glow_radius : 0,
    glow_color : 'white',
    //glow_intensity : 0.5,       // (DON'T NEED FOR FIRE)
    //glow_opacity : 1,           // (DON'T NEED FOR FIRE)
    //shimmer_period : 1000, // shimmer every 1 sec
    //shimmer_randomness : 10, // 10+ is very random
    //shimmer_intensity : 30, // by how much should the glow change in radius
    //shimmer_speed : 5, // max change in radius per frame

    // Fire-specific params
    emission_points : [[500, 600]],
    //scale : 0.25
}

// Different Types of Particle Effect Bullets:
DATA.TESTFIRE = {

}

DATA.TESTSMOKE = {

}

DATA.TESTEXPLOSION = {

}

DATA.TESTVIRUS = {

}

DATA.TESTSPRAY = {

}