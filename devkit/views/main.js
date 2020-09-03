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
import { GameLoop, InitGame } from '../../scripts/update.js';
import { GameManager } from '../../scripts/managers/GameManager.js';
import { GRID_OPTS, FIRE_OPTS } from '../scripts/Options.js';
import { Fire } from '../../scripts/projectiles/Fire.js';

// Globals
var oob_fire;
load_limb = (img) => {


}

// Initialize Game Components
InitGame.does = () => {

    // TODO: USE VIEWS!...
    // TODO: HIDE LOAD IMAGES BUTTON BY DEFAULT AND SHOW IN ACTOR BUILDER VIEW

    Nickel.DEBUG = false;
    Game.set_bg_color("#adadad");
    Game.set_fps(40);
    GameManager.init(Game);
    GameManager.world = new Grid(GRID_OPTS);

    // out of bounds bottom fire
    oob_fire = new Fire(Game, FIRE_OPTS);

    // press space to reset grid
    GameManager.world.load_updater({
        update : () => {
            if (Game.key_upped == Nickel.KEYCODES.SPACE)
                GameManager.world.reset_transform();
        }
    });

    // grid bg color
    var bg = new SimplePoly(Game, [
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
    }

    // TODO: Would like to have some default UI presets that i can use... Maybe store these presets in UIBuidler...?
    // menu labels
    var title = new SimpleText(Game, "Dev Kit:", "Courier", 50, 'red', [50,50], 'left');
    var actor_builder_btn_img = new SimpleImage(Game, null, 0, 0, [0,0], 'gray');
    var actor_builder_btn = new SimpleButton(Game, actor_builder_btn_img, 350, 50, [100,100]);
    actor_builder_btn.mouse_func = (x,y) => GameManager.world.get_grid_point([x,y]); // TODO: should be handled in UIBuilder...
    actor_builder_btn.on_hover = () => {actor_builder_btn_img.color = 'yellow';}
    actor_builder_btn.on_leave = () => {actor_builder_btn_img.color = 'gray';}
    actor_builder_btn.on_click = () => {actor_builder_btn_img.color = 'orange';}
    var actor_builder_btn_txt = new SimpleText(Game, "Actor Builder", "Courier", 32, 'black', actor_builder_btn.center, 'center');
    GameManager.world.load_updater(title);
    GameManager.world.load_updater(actor_builder_btn);
    GameManager.world.load_updater(actor_builder_btn_txt);

    // for testing...
    Nickel.GLOBALS.gm = GameManager;
}

// Game Loop:
GameLoop.does = () => {

    Game.clear();
    oob_fire.update();
    GameManager.handle();

    // maybe can handle this in GameManager....?
    Game.reset_wheel();
    Game.reset_key_upped();
    Game.reset_mouse_upped();
}

// Start Game:
Game.run();