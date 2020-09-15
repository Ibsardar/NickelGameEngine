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
import { Limb } from '../../scripts/Limb.js';
import { Interact } from '../../scripts/managers/InteractionManager.js';
import { Projectile } from '../../scripts/projectiles/Projectile.js';
import { ParticleBulletSystem } from '../../scripts/projectiles/ParticleBulletSystem.js';
import { Actor } from '../../scripts/Actor.js';

export { actor_builder }

// Module Globals
var actor_builder = new View();
var limbs = [];
var actual_limbs = [];
var selected;

// Set global function (set in devkit.html) to load an image as a Limb object
load_limb = (image) => {

    // load image as limb and set in center of view
    var limb = new Limb(Game, image, true);
    var ctr = GameManager.world.get_grid_point([Game.get_w()/2, Game.get_h()/2]);
    limb.sprite.set_center(ctr[0], ctr[1]);
    limbs.push(limb.sprite);
    actual_limbs.push(limb);
    limb.sprite.__i = limbs.length - 1;
    GameManager.world.load_updater(limb);

    // select sprite and update properties on right hand side
    // also auto-resize if too small
    selected = limb.sprite;
    if (selected.get_width() < 32 && selected.get_height() < 32)
        selected.set_scale(5);
    $('#scale-x').val(selected ? selected.get_scalex() : '');
    $('#scale-y').val(selected ? selected.get_scaley() : '');
    $('#pos-x').val(selected ? selected.get_x() : '');
    $('#pos-y').val(selected ? selected.get_y() : '');
    $('#pivot-x').val(selected ? selected.get_origin()[0] : '');
    $('#pivot-y').val(selected ? selected.get_origin()[1] : '');
}

// Initialize Game Components
actor_builder.game_init = () => {

    // setup
    Nickel.DEBUG = true;
    Game.set_bg_color("#adadad");
    Game.set_fps(120);
    GameManager.reset();
    GameManager.init(Game);
    GameManager.world = new Grid(GRID_OPTS);
    GameManager.set_groups(['game'], 'only');
    GameManager.set_timed_custom_gc(
        (item) => !((item instanceof Limb) && (!item.sprite || item.sprite.is_dead())),
        actual_limbs
    );
    UIBuilder.config(AB_UI_OPTS)
    Interact.defer_resets();
    Interact.skip_dead();

    // show elements
    $('.dk-rnav').show('slow');

    // apply scale
    $('#scale-x').on('change', () => {
        var inp = parseFloat($('#scale-x').val());
        if (inp <= 0) $('#scale-x').val(selected.get_scalex());
        else selected.set_scalex(inp);
    });
    $('#scale-y').on('change', () => {
        var inp = parseFloat($('#scale-y').val());
        if (inp <= 0) $('#scale-y').val(selected.get_scaley());
        else selected.set_scaley(inp);
    });
    $('#pos-x').on('change', () => selected ? selected.set_x(parseFloat($('#pos-x').val())) : '');
    $('#pos-y').on('change', () => selected ? selected.set_y(parseFloat($('#pos-y').val())) : '');
    // todo: make a fake pivot graphic (like a crosshair or something) instead of setting origin directly
    $('#pivot-x').on('change', () => selected ? selected.set_origin([parseFloat($('#pivot-x').val()), parseFloat($('#pivot-y').val())]) : '');
    $('#pivot-y').on('change', () => selected ? selected.set_origin([parseFloat($('#pivot-x').val()), parseFloat($('#pivot-y').val())]) : '');

    // press space to reset grid
    // update drag effect
    GameManager.world.load_updater({
        update : () => {

            if (Game.mouse_curr === 0) {
                
                // update properties of selected on right hand side
                $('#scale-x').val(selected ? selected.get_scalex() : '');
                $('#scale-y').val(selected ? selected.get_scaley() : '');
                $('#pos-x').val(selected ? selected.get_x() : '');
                $('#pos-y').val(selected ? selected.get_y() : '');
                $('#pivot-x').val(selected ? selected.get_origin()[0] : '');
                $('#pivot-y').val(selected ? selected.get_origin()[1] : '');
            }
            
            if (Game.key_upped == Nickel.KEYCODES.SPACE)
                GameManager.world.reset_transform();

            Interact.onhover(limbs)
                .top()
                .enter((spr,mpos) => {console.log('onhover>top>enter>'+spr.id+'@'+mpos)})
                .while((spr,mpos) => {console.log('onhover>top>while>'+spr.id+'@'+mpos)})
                .leave((spr,mpos) => {console.log('onhover>top>leave>'+spr.id+'@'+mpos)})
                .else((mpos) => {/*console.log('onhover>top>else>[no sprite]@'+mpos)*/});

            Interact.onhover(limbs)
                .all_reversed()
                .enter((sprs,mpos) => {console.log('onhover>top>enter>[('+sprs.length+') sprites]@'+mpos)})
                .while((sprs,mpos) => {console.log('onhover>top>while>[('+sprs.length+') sprites]@'+mpos)})
                .leave((sprs,mpos) => {console.log('onhover>top>leave>[('+sprs.length+') sprites]@'+mpos)})
                .else((mpos) => {/*console.log('onhover>top>else>[no sprite]@'+mpos)*/});

            Interact.onrightclick(limbs)
                .top()
                .do((spr,mpos) => {
                    console.log('onrightclick>top>do>'+spr.id+'@'+mpos);
                    if (selected && selected.__i === spr.__i) {
                        selected = null;
                        console.log('Sprite unselected!');
                        actual_limbs[spr.__i].destroy();
                        console.log('Sprite destroyed! ID# '+spr.id);
                    } else {
                        actual_limbs[spr.__i].destroy();
                        console.log('Sprite destroyed! ID# '+spr.id);
                    }
                })
                .else((mpos) => {
                    console.log('onrightclick>top>do>else>[no sprite]@'+mpos);
                });
                
            Interact.onleftclick(limbs)
                .top()
                .do((spr,mpos) => {
                    console.log('onleftclick>top>do>'+spr.id+'@'+mpos);
                    selected = spr;
                    console.log('Sprite selected! ID# '+spr.id);
                })
                .else((mpos) => {
                    console.log('onleftclick>top>do>else>[no sprite]@'+mpos);
                    selected = null;
                    console.log('Sprite unselected!');
                });
            Interact.onleftclick(limbs)
                .bottom()
                .do((spr,mpos) => console.log('onleftclick>bottom>do>'+spr.id+'@'+mpos));
            Interact.onleftclick(limbs)
                .all()
                .do((sprs,mpos) => console.log('onleftclick>all>do>[('+sprs.length+') sprites]@'+mpos));
            Interact.onleftclick(limbs)
                .all_reversed()
                .do((sprs,mpos) => console.log('onleftclick>all_reversed>do>[('+sprs.length+') sprites]@'+mpos));

            Interact.drag(limbs)
                .start((spr,mpos) => console.log('drag>start>'+spr.id+'@'+mpos))
                .while((spr,mpos) => console.log('drag>while>'+spr.id+'@'+mpos))
                .end((spr,mpos) => console.log('drag>end>'+spr.id+'@'+mpos));

            Interact.reset();
        }
    });

    // grid colors
    var bg = UIBuilder.grid({
        position : [0,0],
        width : Game.get_w(),
        height : Game.get_h(),
        grid_color : '#434343'
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
actor_builder.game_loop = () => {

    Game.clear();
    GameManager.handle();
}