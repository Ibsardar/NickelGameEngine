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
import { GRID_OPTS, FIRE_OPTS, MENU_UI_OPTS } from '../scripts/Options.js';
import { Fire } from '../../scripts/projectiles/Fire.js';
import { View } from '../../scripts/View.js';
import { actor_builder } from './actor_builder.js';
import { UIBuilder } from '../../scripts/builders/UIBuilder.js';
import { Projectile } from '../../scripts/projectiles/Projectile.js';
import { ParticleBulletSystem } from '../../scripts/projectiles/ParticleBulletSystem.js';
import { Actor } from '../../scripts/Actor.js';

export { menu }

// Module Globals
var menu = new View();
var oob_fire; //<---- not working correctly

// Initialize Game Components
menu.game_init = () => {

    // setup
    Nickel.DEBUG = true;
    Game.set_bg_color("#adadad");
    Game.set_fps(40);
    GameManager.reset();
    GameManager.init(Game);
    GameManager.world = new Grid(GRID_OPTS);
    GameManager.set_groups(['game'], 'only'); // fire is in 'ui' group so it will not be updated
    UIBuilder.config(MENU_UI_OPTS)

    // turn off renderer for this page
    GameManager.world.renderer.off();

    // hide elements
    $('.dk-rnav').hide('slow');

    // out of bounds bottom fire
    oob_fire = new Fire(Game, FIRE_OPTS);  //<--- not working correctly

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

    // menu labels
    var title = UIBuilder.label({
        text : 'Dev Kit:',
        align : 'left',
        position : [50,50],
        text_color : 'red'
    });
    var actor_builder_btn = UIBuilder.text_button({
        text : 'Actor Builder',
        align : 'left',
        position : [100,100],
        size : 4
    });
    actor_builder_btn.on_hover = () =>   { actor_builder_btn.image.color = 'yellow'; }
    actor_builder_btn.on_leave = () =>   { actor_builder_btn.image.color = UIBuilder.color_secondary; }
    actor_builder_btn.on_click = () =>   { actor_builder_btn.image.color = 'orange'; }
    actor_builder_btn.on_release = () => { View.next(actor_builder).init(); }

    // for testing...
    Nickel.GLOBALS.gm = GameManager;
    Nickel.GLOBALS.ren = GameManager.world.renderer;
    Nickel.GLOBALS.counts = (clear=true) => {
        if (clear) console.clear();
        console.log("\
        Projectile:\n\
            groups:             " + Projectile.number_of_groups + "\n\
            count:              " + Projectile.count + "\n\
            dead:               " + Projectile.dead_count + "\n\
        ParticleBulletSystem:\n\
            groups:             " + ParticleBulletSystem.number_of_groups + "\n\
            count (systems):    " + ParticleBulletSystem.count + "\n\
            count (particles):  " + ParticleBulletSystem.particle_count + "\n\
            dead (systems):     " + ParticleBulletSystem.dead_count + "\n\
        Actor:\n\
            groups:             " + Actor.number_of_groups + "\n\
            count:              " + Actor.count + "\n\
            dead:               " + Actor.dead_count + "\n\
        World:\n\
            count:              " + GameManager.world.load.length + "\n\
        GC:\n\
            time left:          " + Math.round(GameManager._gc_timer.remaining() / 1000) + "s\n\
        ");
    }
}

// Game Loop:
menu.game_loop = () => {

    Game.clear();
    oob_fire.update();  //<----- not working correctly
    GameManager.handle();
}