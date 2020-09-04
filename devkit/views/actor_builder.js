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

    // grid bg color
    var bg = UIBuilder.grid({
        position : [0,0],
        width : Game.get_w(),
        height : Game.get_h()
    });
    /*var bg = new SimplePoly(Game, [
        [0,0],
        [Game.get_w(),0],
        [Game.get_w(),Game.get_h()],
        [0,Game.get_h()]
    ], true);
    bg.stroke_color = 'black';
    bg.stroke_fill = '#343434';
    bg.stroke_width = 3;
    GameManager.world.load_updater(bg);

    // grid lines
    var x_across = 20;
    var x_space = Game.get_w() / x_across;
    for (var x=0; x<x_across; x++) {
        var line = new SimpleLine(Game, [x * x_space,0], [x * x_space,Game.get_h()]);
        line.stroke_color = '#676767';
        GameManager.world.load_updater(line);
    }
    var y_across = 10;
    var y_space = Game.get_h() / y_across;
    for (var y=0; y<y_across; y++) {
        var line = new SimpleLine(Game, [0,y * y_space], [Game.get_w(),y * y_space]);
        line.stroke_color = '#676767';
        GameManager.world.load_updater(line);
    }*/

    // TODO: Would like to have some default UI presets that i can use... Maybe store these presets in UIBuidler...?
    // actor_builder labels
    var title = UIBuilder.label({
        text : 'Actor Builder:',
        align : 'left',
        position : [50,50]
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
    /*
    var title = new SimpleText(Game, "Dev Kit:", "Courier", 50, 'red', [50,50], 'left');
    var actor_builder_btn_img = new SimpleImage(Game, null, 0, 0, [0,0], 'gray');
    var actor_builder_btn = new SimpleButton(Game, actor_builder_btn_img, 350, 50, [100,100]);
    actor_builder_btn.mouse_func = (x,y) => GameManager.world.get_grid_point([x,y]); // TODO: should be handled in UIBuilder...
    actor_builder_btn.on_hover = () => {actor_builder_btn_img.color = 'yellow';}
    actor_builder_btn.on_leave = () => {actor_builder_btn_img.color = 'gray';}
    actor_builder_btn.on_click = () => {actor_builder_btn_img.color = 'orange';}
    actor_builder_btn.on_release = () => {View.next(actor_builder).init();}
    var actor_builder_btn_txt = new SimpleText(Game, "Actor Builder", "Courier", 32, 'black', actor_builder_btn.center, 'center');
    GameManager.world.load_updater(title);
    GameManager.world.load_updater(actor_builder_btn);
    GameManager.world.load_updater(actor_builder_btn_txt);
    */

    // for testing...
    Nickel.GLOBALS.gm = GameManager;
}

// Game Loop:
actor_builder.game_loop = () => {

    Game.clear();
    GameManager.handle();
}