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
import { View } from '../../scripts/View.js';
import { UIBuilder } from '../../scripts/builders/UIBuilder.js';
import { Limb } from '../../scripts/Limb.js';
import { Interact } from '../../scripts/managers/InteractionManager.js';

export { actor_builder }

// Module Globals
var actor_builder = new View();
var limbs = [];
var selected;

// Initialize Game Components
actor_builder.game_init = () => {

    // setup
    Nickel.DEBUG = true;
    Nickel.VERBOSE = false;
    Game.set_bg_color("#adadad");
    Game.set_fps(120);
    GameManager.reset();
    GameManager.init(Game);
    GameManager.world = new Grid(GRID_OPTS);
    GameManager.set_groups(['game'], 'only');
    GameManager.set_timed_custom_gc(
        (item) => !((item instanceof Limb) && (!item.sprite || item.sprite.is_dead())),
        limbs
    );
    UIBuilder.config(AB_UI_OPTS)
    Interact.defer_resets();
    Interact.skip_dead();
    
    // (defined in devkit.html)
    load_limb = (image) => {

        // load image as limb and set in center of view
        var limb = new Limb(Game, image, true);
        var ctr = GameManager.world.get_grid_point([Game.get_w()/2, Game.get_h()/2]);
        limb.sprite.set_center(ctr[0], ctr[1]);
        limbs.push(limb);
        GameManager.world.load_updater(limb);

        // select sprite and update properties on right hand side
        // also auto-resize if too small
        selected = limb;
        if (selected.sprite.get_width() < 32 && selected.sprite.get_height() < 32)
            selected.sprite.set_scale(5);
        $('#scale-x').val(selected.sprite.get_scalex());
        $('#scale-y').val(selected.sprite.get_scaley());
        $('#pos-x').val(selected.sprite.get_x());
        $('#pos-y').val(selected.sprite.get_y());
        $('#pivot-x').val(selected.sprite.get_origin()[0]); // don't set origin directly
        $('#pivot-y').val(selected.sprite.get_origin()[1]); // don't set origin directly
    }

    // show elements
    $('.dk-rnav').show('slow');

    // apply scale, pos, pivot
    $('#scale-x').on('change', () => {
        if (!selected) return;
        var inp = parseFloat($('#scale-x').val());
        if (inp <= 0) $('#scale-x').val(selected.sprite.get_scalex());
        else selected.sprite.set_scalex(inp);
    });
    $('#scale-y').on('change', () => {
        if (!selected) return;
        var inp = parseFloat($('#scale-y').val());
        if (inp <= 0) $('#scale-y').val(selected.sprite.get_scaley());
        else selected.sprite.set_scaley(inp);
    });
    $('#pos-x').on('change', () => selected ? selected.sprite.set_x(parseFloat($('#pos-x').val())) : '');
    $('#pos-y').on('change', () => selected ? selected.sprite.set_y(parseFloat($('#pos-y').val())) : '');
    $('#pivot-x').on('change', () => selected ? selected.sprite.set_origin([parseFloat($('#pivot-x').val()), parseFloat($('#pivot-y').val())]) : ''); // don't set origin directly
    $('#pivot-y').on('change', () => selected ? selected.sprite.set_origin([parseFloat($('#pivot-x').val()), parseFloat($('#pivot-y').val())]) : ''); // don't set origin directly

    // press space to reset grid
    // update drag effect
    GameManager.world.load_updater({
        update : () => {

            if (Game.mouse_curr === 0) {
                
                // update properties of selected on right hand side
                $('#scale-x').val(selected ? selected.sprite.get_scalex() : '');
                $('#scale-y').val(selected ? selected.sprite.get_scaley() : '');
                $('#pos-x').val(selected ? selected.sprite.get_x() : '');
                $('#pos-y').val(selected ? selected.sprite.get_y() : '');
                $('#pivot-x').val(selected ? selected.sprite.get_origin()[0] : '');
                $('#pivot-y').val(selected ? selected.sprite.get_origin()[1] : '');
            }
            
            if (Game.key_upped == Nickel.KEYCODES.SPACE)
                GameManager.world.reset_transform();

            Interact.onrightclick(limbs)
                .top()
                .do((limb,mpos) => {
                    if (selected && selected.sprite.id === limb.sprite.id) {
                        selected = null;
                        console.log('Limb unselected!');
                        limb.destroy();
                        console.log('Limb destroyed! ID# '+limb.sprite.id);
                    } else {
                        limb.destroy();
                        console.log('Limb destroyed! ID# '+limb.sprite.id);
                    }
                })
                .else((mpos) => {
                });
                
            Interact.onleftclick(limbs)
                .top()
                .do((limb,mpos) => {
                    selected = limb;
                    console.log('Limb selected! ID# '+limb.sprite.id);
                })
                .else((mpos) => {
                    selected = null;
                    console.log('Limb unselected!');
                });

            Interact.drag(limbs);

            Interact.reset();
        }
    });

    // grid
    var bg = UIBuilder.grid({
        position : [0,0],
        width : Game.get_w(),
        height : Game.get_h(),
        grid_color : '#434343'
    });

    // labels
    var title = UIBuilder.label({
        text : 'Actor Builder:',
        align : 'left',
        position : [50,50],
        text_color : 'red'
    });

    // btns
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
}

// Game Loop:
actor_builder.game_loop = () => {

    Game.clear();
    GameManager.handle();
}