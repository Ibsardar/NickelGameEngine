////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Main
//  Filename:       main.js
//  Date:           4/13/2020
//  Description:    Main script dependant module to be included towards the end
//                  of the html file.
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

// Load Modules:
import { Game } from '../../scripts/game.js';
import { DATA } from '../../scripts/data_loader2.js';
import { GameManager } from '../../scripts/managers/GameManager.js';
import { GRID_OPTS, FIRE_OPTS, AB_UI_OPTS } from '../scripts/Options.js';
import { Fire } from '../../scripts/projectiles/Fire.js';
import { View } from '../../scripts/View.js';
import { UIBuilder } from '../../scripts/builders/UIBuilder.js';

export { actor_builder }

// Module Globals
var actor_builder = new View();

// Initialize Game Components
actor_builder.game_init = () => {

    // setup
    Nickel.DEBUG = false;
    Game.set_bg_color("#adadad");
    Game.set_fps(40);
    GameManager.reset();
    GameManager.init(Game);
    GameManager.world = new Grid(GRID_OPTS);
    GameManager.set_groups(['game'], 'only');
    UIBuilder.config(AB_UI_OPTS)

    // hide elements
    $('.actor-builder').show('slow');

    // press space to reset grid
    GameManager.world.load_updater({
        update : () => {
            if (Game.key_upped == Nickel.KEYCODES.SPACE)
                GameManager.world.reset_transform();
        }
    });

    // grid colors
    var bg = UIBuilder.grid({
        position : [0,0],
        width : Game.get_w(),
        height : Game.get_h()
    });

    // actor_builder labels
    var title = UIBuilder.label({
        text : 'Actor Builder:',
        align : 'left',
        position : [50,50],
        text_color : 'red'
    });
    var main_menu_btn = UIBuilder.text_button({
        text : 'Main Menu',
        align : 'left',
        position : [100,100],
    });
    main_menu_btn.on_hover = () =>   { main_menu_btn.image.color = 'yellow'; }
    main_menu_btn.on_leave = () =>   { main_menu_btn.image.color = UIBuilder.color_secondary; }
    main_menu_btn.on_click = () =>   { main_menu_btn.image.color = 'orange'; }
    main_menu_btn.on_release = () => {
        GameManager.destroy_all();
        View.previous(actor_builder).init();
    }

    // for testing...
    Nickel.GLOBALS.gm = GameManager;
}

// Game Loop:
actor_builder.game_loop = () => {

    Game.clear();
    GameManager.handle();
}