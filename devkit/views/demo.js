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
import { SIMPLE_GRID_OPTS, FIRE_OPTS, DEMO_UI_OPTS } from '../scripts/Options.js';
import { View } from '../../scripts/View.js';
import { UIBuilder } from '../../scripts/builders/UIBuilder.js';
import { Limb } from '../../scripts/Limb.js';
import { Interact } from '../../scripts/managers/InteractionManager.js';
import { EditorItem } from '../scripts/EditorItem.js';

export { demo }

// Module Globals (variables)
var demo = new View();
var unit;
const TURN_GRADUALLY = 0;
const FORCE_MULTIPLIER = 0.05;

// Initialize Game Components
demo.game_init = () => {

    // setup
    Nickel.DEBUG = false;
    Nickel.VERBOSE = false;
    Game.set_bg_color("#adadad");
    Game.set_fps(120);
    GameManager.reset();
    GameManager.init(Game);
    GameManager.world = new Grid(SIMPLE_GRID_OPTS);
    GameManager.set_groups(['game'], 'only');
    UIBuilder.config(DEMO_UI_OPTS);
    Interact.defer_resets();
    Interact.skip_dead();

    // show elements
    $('.dk-rnav').hide('slow');

    // custom unit
    unit = new Sprite(Game, DATA.IMG.CREEP_01);
    unit.set_origin_centered();
    unit.set_center(400, 300);
    unit.set_rot_max(3); // 3 degrees at a time
    GameManager.world.load_updater(unit);

    // Game Interactions
    GameManager.world.load_updater({
        update : () => {
            
            // press space to reset grid
            if (Game.key_upped == Nickel.KEYCODES.SPACE)
                GameManager.world.reset_transform();
                
            Interact.onleftclick().top().else(
                (mpos) => {
                    
                    unit.turn_to(mpos, TURN_GRADUALLY);
                    
                    var start = unit.get_center(); // unit pos
                    var end = mpos; // mouse pos
                    var vector = Nickel.v2d.sub(end, start); // from unit to mouse
                    vector = Nickel.v2d.mult_s(FORCE_MULTIPLIER, vector); // weaken the force
                    unit.apply_force(vector); // move!
                }
            );

            Interact.reset();
        }
    });

    // labels
    var title = UIBuilder.label({
        text : 'Demo #1:',
        align : 'left',
        position : [50,50],
        text_color : 'red'
    });

    // btns
    var main_menu_btn = UIBuilder.text_button({
        text : 'Main Menu',
        align : 'left',
        position : [100,100]
    });
    main_menu_btn.on_hover   = () => { main_menu_btn.image.color = 'yellow'; }
    main_menu_btn.on_leave   = () => { main_menu_btn.image.color = UIBuilder.color_secondary; }
    main_menu_btn.on_click   = () => { main_menu_btn.image.color = 'orange'; }
    main_menu_btn.on_release = () => {
        GameManager.destroy_all();
        View.previous(demo).init();
    }
}

// Game Loop:
demo.game_loop = () => {

    Game.clear();
    GameManager.handle();
}