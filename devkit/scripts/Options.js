////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           4/15/2020
//  Description:    See below...
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
//  Copyright (c) 2020 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

import { Game } from "../../scripts/game.js";
import { DATA } from "../../scripts/data_loader2.js";
import { GameManager } from "../../scripts/managers/GameManager.js";

export { GRID_OPTS, FIRE_OPTS, MENU_UI_OPTS, AB_UI_OPTS };

// UI by view options
var MENU_UI_OPTS = {
    scene : Game,
    manager : GameManager,
    element_size_4 : [350, 50],
    weight : 'bold',
    color_primary : '#676767',
    color_secondary : '#343434',
    color_tertiary : 'red'
}
var AB_UI_OPTS = {
    scene : Game,
    manager : GameManager,
    element_size_4 : [350, 50],
    weight : 'bold',
    color_primary : '#676767',
    color_secondary : '#343434',
    color_tertiary : 'red'
}

// all of these are used in GRID_OPTS
var grid_bg, grid_scroll, grid_rot, grid_zoom, grid_lims, grid_nav;
grid_bg = {w:1280, h:720}
grid_scroll = {
    buffer   : 16, 
    speed    : 9,
    controls : {
        mouse: false,
        right: Nickel.KEYCODES.LEFTARROW,
        down: Nickel.KEYCODES.UPARROW,
        left: Nickel.KEYCODES.RIGHTARROW,
        up: Nickel.KEYCODES.DOWNARROW,
    }
}
grid_rot = null;
grid_zoom = {
    origin   : 'mouse',
    bounds   : {'in': 2, 'out': 0.85},
    speed    : 4,
    controls : true /* scroll wheel default control */
}
grid_lims = {
    pad_top    : 100,
    pad_left   : 100,
    pad_right  : 100,
    pad_bottom : 100
}
grid_nav = null;

// option data for Grid
var GRID_OPTS = {
    scene               : Game,
    /*matrix              : /*[[1,2,3,2,3,3,2,2,2,3,2,3,3,2,2,0,1,2,3,2],
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
                           [0,0,1,0,0,1,1,3,2,3,2,3,3,2,2,0,1,2,3,2]],* /
                          [[3,3,0,3,3],
                           [3,0,1,0,3],
                           [0,1,2,1,0],
                           [3,0,1,0,3],
                           [3,3,0,3,3]], */
    /*types               : { 0:DATA.TILE_00,
                            1:DATA.TILE_01,
                            2:DATA.TILE_02,
                            3:DATA.TILE_03 }, */
    bg_data             : grid_bg,
    scroll_data         : grid_scroll,
    rotation_data       : grid_rot,
    zoom_data           : grid_zoom,
    limit_data          : grid_lims,
    navmesh_data        : grid_nav
}

//all of these are used in FIRE_OPTS
var fire_ptc, fire_ps, fire_turbulence;
var fire_ptc = {
    context                 : Game.context,
    shape                   : ParticleBuilder.TYPES.ELLIPSE,
    enable_translation      : true,
    enable_rotation         : false,
    enable_scaling          : true,
    enable_transparency     : true,
    enable_fill             : false,
    enable_stroke           : false
}
var fire_ps = {
    particle_data           : fire_ptc,
    scene                   : Game,
    lifetime_mseconds       : Infinity,
    position                : [0,0],
    rotation                : 0, // experimental <-- probably does not work either
    scale                   : [1,1], // experimental <- does not work
    create_amount           : 3,
    //create_amount_var       : [-3,3],
    //create_amount_bounds    : [7,11],
    create_period_mseconds  : 50
    //create_period_var       : [-3,3],
    //create_period_bounds    : [1,25]
}
var fire_turbulence = {
    v0x :                   [-0.35,0.35],
    //v0y :                   [0,1]
}

// option data for Fire (UI Fire)
var FIRE_OPTS = {
    particle_sys_data :     fire_ps,
    script_effect :         null,
    targets :               [],
    group :                 'ui',
    damage :                0,
    health :                1,
    snd_create :            null,//DATA.SND.COIN,
    snd_destroy :           null,//DATA.SND.DIE,

    // Glow-specific params:
    glow_radius :           0,
    glow_color :            'white',
    //glow_intensity :      0.5,       // (DON'T NEED FOR FIRE)
    //glow_opacity :        1,           // (DON'T NEED FOR FIRE)
    //shimmer_period :      1000, // shimmer every 1 sec
    //shimmer_randomness :  10, // 10+ is very random
    //shimmer_intensity :   30, // by how much should the glow change in radius
    //shimmer_speed :       5, // max change in radius per frame

    // Fire-specific params
    emission_points :       [
                                [Game.get_w() / 20 * 1, Game.get_h()],
                                [Game.get_w() / 20 * 19, Game.get_h()]
                            ],
    colors :                Nickel.util.r_elem([
                                ['white', 'cyan', 'turquoise', '#94b6b9'],
                                ['red', 'red', 'orange', '#ffd858'],
                                ['darkgreen', 'green', '#98fb98', 'lightgreen'],
                                ['red', 'hotpink', 'pink', 'lightpink'],
                            ]),
    turbulence :            fire_turbulence,
    temperature_calculation_max : 2000,
    force :                 [0,-0.025]
}