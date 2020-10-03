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
import { EditorItem } from '../scripts/EditorItem.js';

export { actor_builder }

// Module Globals (variables)
var actor_builder = new View();
var limbs = [];
var selected;
var mode='select'; // body, select, pivot, connect, joint
var snaps=[0,0];
var bg;
var STEPS = {
    OVERLAY : 5,
    UI : 4,
    GAME_OVERLAY : 3,
    GAME : 2,
    GAME_UNDERLAY : 1,
    WORLD : 0
};
var LAYERS = {
    UI : {
        MAIN : 50
    },
    GAME : {
        MAIN : 50
    },
    WORLD : {
        MAIN : 50
    }
};

// Module Globals (functions)
var select = (item) => {

    // select item and update properties on right hand side
    selected = item;
    $('#scale-x').val(selected.sprite.get_scalex());
    $('#scale-y').val(selected.sprite.get_scaley());
    $('#pos-x').val(selected.sprite.get_x());
    $('#pos-y').val(selected.sprite.get_y());
    $('#pos-z').val(selected.sprite.get_layer());
    $('#pivot-x').val(selected.sprite.get_origin()[0]); // don't set origin directly
    $('#pivot-y').val(selected.sprite.get_origin()[1]); // don't set origin directly
    console.log('Item selected! Sprite-ID# '+selected.sprite.id);
}
var unselect = () => {

    // unselect item and clear properties on right hand side
    selected = null;
    $('#scale-x').val('');
    $('#scale-y').val('');
    $('#pos-x').val('');
    $('#pos-y').val('');
    $('#pos-z').val('');
    $('#pivot-x').val('');
    $('#pivot-y').val('');
    console.log('Item unselected!');
}
var snap = (item) => {

    // snap the item separately in x and y coordinates
    if (snaps[0]) {
        var x = Nickel.util.round(item.sprite.get_x()/snaps[0]) * snaps[0];
        item.sprite.set_x(x);
    }
    if (snaps[1]) {
        var y = Nickel.util.round(item.sprite.get_y()/snaps[1]) * snaps[1];
        item.sprite.set_y(y);
    }
}
var reset_grid = () => {

    // replace grid (with snapped lines)
    if (snaps[0] || snaps[1]) {
        var sectors = [
            !snaps[0] ? 0 : Math.ceil(Game.get_w() / snaps[0]),
            !snaps[1] ? 0 : Math.ceil(Game.get_h() / snaps[1])
        ];
        bg = UIBuilder.grid({
            replace : bg,
            width : !snaps[0] ? Game.get_w() : sectors[0] * snaps[0], // overestimate width
            height : !snaps[1] ? Game.get_h() : sectors[1] * snaps[1], // overestimate height
            grid_color : '#494943', // slightly yellow when snapping
            rows : !snaps[1] ? 1 : sectors[1],
            cols : !snaps[0] ? 1 : sectors[0],
            border_thickness : 1
        });
        console.log('Grid snapped!');
    // replace grid (with default liness)
    } else {
        bg = UIBuilder.grid({
            replace : bg,
            position : [0,0],
            width : Game.get_w(),
            height : Game.get_h(),
            grid_color : '#434343'
        });
        console.log('Grid reset to default!');
    }
}
// (defined in devkit.html)
load_limb = (image) => {

    // load image as limb and set in center of view
    var limb = new Limb(Game, image, true);
    var item = new EditorItem(limb, 'destroy');
    var ctr = GameManager.world.get_grid_point([Game.get_w()/2, Game.get_h()/2]);
    item.sprite.set_center(ctr[0], ctr[1]);
    limbs.push(item);
    GameManager.world.renderer.obj.add(STEPS.GAME, LAYERS.GAME.MAIN, item);
    //GameManager.world.load_updater(item);

    // also auto-resize if too small
    if (item.sprite.get_width() < 32 && item.sprite.get_height() < 32)
        item.sprite.set_scale(5);

    // select
    select(item);
}

// Initialize Game Components
actor_builder.game_init = () => {

    // setup
    Nickel.DEBUG = true;
    Nickel.VERBOSE = true;
    Game.set_bg_color("#adadad");
    Game.set_fps(120);
    GameManager.reset();
    GameManager.init(Game);
    GameManager.world = new Grid(GRID_OPTS);
    GameManager.set_groups(['game'], 'only');
    GameManager.register({
        classref: EditorItem, // need for gc, need for interact-mngr
        is_dead: (o) => !o.sprite || o.sprite.is_dead(), // need for gc
        gc_condition: () => {}, // optional for gc
        collect_from: [limbs], // optional for gc
        timely: true, // optional for gc
        path_to_sprite: ['sprite'] // need for interact-mngr
    });
    UIBuilder.config(AB_UI_OPTS);
    Interact.defer_resets();
    Interact.skip_dead();

    // build renderer stack
    GameManager.world.renderer.step.add(STEPS.UI);
    GameManager.world.renderer.step.add(STEPS.GAME);
    GameManager.world.renderer.step.add(STEPS.WORLD);
    GameManager.world.renderer.layer.add(STEPS.UI, LAYERS.UI.MAIN);
    GameManager.world.renderer.layer.add(STEPS.GAME, LAYERS.GAME.MAIN);
    GameManager.world.renderer.layer.add(STEPS.WORLD, LAYERS.WORLD.MAIN);

    // show elements
    $('.dk-rnav').show('slow');

    // apply scale, pos, pivot, snap
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
    $('#pos-z').on('change', () => selected ? selected.sprite.set_layer(parseInt($('#pos-z').val())) : '');
    $('#pivot-x').on('change', () => selected ? selected.sprite.set_origin([parseFloat($('#pivot-x').val()), parseFloat($('#pivot-y').val())]) : ''); // don't set origin directly
    $('#pivot-y').on('change', () => selected ? selected.sprite.set_origin([parseFloat($('#pivot-x').val()), parseFloat($('#pivot-y').val())]) : ''); // don't set origin directly
    $('#snap-x').on('change', () => {
        var input = parseFloat($('#snap-x').val());
        if (input < 0) input = 0; // min snap
        if (input > 256) input = 256; // max snap
        $('#snap-x').val(input);
        snaps[0] = input;
        reset_grid();
    });
    $('#snap-y').on('change', () => {
        var input = parseFloat($('#snap-y').val());
        if (input < 0) input = 0; // min snap
        if (input > 256) input = 256; // max snap
        $('#snap-y').val(input);
        snaps[1] = input;
        reset_grid();
    });
    $('#m-b').on('click', () => {
        mode = 'body';
        unselect();
        $('#m-b').addClass('dk-active');
        $('#m-s').removeClass('dk-active');
        $('#m-p').removeClass('dk-active');
        $('#m-c').removeClass('dk-active');
        $('#m-j').removeClass('dk-active');
    });
    $('#m-s').on('click', () => {
        mode = 'select';
        $('#m-b').removeClass('dk-active');
        $('#m-s').addClass('dk-active');
        $('#m-p').removeClass('dk-active');
        $('#m-c').removeClass('dk-active');
        $('#m-j').removeClass('dk-active');
    });
    $('#m-p').on('click', () => {
        mode = 'pivot';
        unselect();
        $('#m-b').removeClass('dk-active');
        $('#m-s').removeClass('dk-active');
        $('#m-p').addClass('dk-active');
        $('#m-c').removeClass('dk-active');
        $('#m-j').removeClass('dk-active');
    });
    $('#m-c').on('click', () => {
        mode = 'connect';
        unselect();
        $('#m-b').removeClass('dk-active');
        $('#m-s').removeClass('dk-active');
        $('#m-p').removeClass('dk-active');
        $('#m-c').addClass('dk-active');
        $('#m-j').removeClass('dk-active');
    });
    $('#m-j').on('click', () => {
        mode = 'joint';
        unselect();
        $('#m-b').removeClass('dk-active');
        $('#m-s').removeClass('dk-active');
        $('#m-p').removeClass('dk-active');
        $('#m-c').removeClass('dk-active');
        $('#m-j').addClass('dk-active');
    });

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
                $('#pos-z').val(selected ? selected.sprite.get_layer() : '');
                $('#pivot-x').val(selected ? selected.sprite.get_origin()[0] : '');
                $('#pivot-y').val(selected ? selected.sprite.get_origin()[1] : '');
            }
            
            if (Game.key_upped == Nickel.KEYCODES.SPACE)
                GameManager.world.reset_transform();

            Interact.onrightclick(limbs)
                .top()
                .do((limb,mpos) => {
                    if (selected && selected.sprite.id === limb.sprite.id) {
                        unselect();
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
                    if (mode == 'select') {
                        select(limb);
                    }
                })
                .else((mpos) => {
                    if (mode == 'select') {
                        unselect();
                    }
                });

            if (mode == 'select')
                Interact.drag(limbs)
                .while((item,mpos) => {
                    snap(item);
                });

            Interact.reset();
        }
    });

    // grid (default)
    bg = UIBuilder.grid({
        position : [0,0],
        width : Game.get_w(),
        height : Game.get_h(),
        grid_color : '#434343',
        step : STEPS.WORLD,
        layer : LAYERS.WORLD.MAIN
    });

    // labels
    var title = UIBuilder.label({
        text : 'Actor Builder:',
        align : 'left',
        position : [50,50],
        text_color : 'red',
        step : STEPS.UI,
        layer : LAYERS.UI.MAIN
    });

    // btns
    var main_menu_btn = UIBuilder.text_button({
        text : 'Main Menu',
        align : 'left',
        position : [100,100],
        step : STEPS.UI,
        layer : LAYERS.UI.MAIN
    });
    main_menu_btn.on_hover   = () => { main_menu_btn.image.color = 'yellow'; }
    main_menu_btn.on_leave   = () => { main_menu_btn.image.color = UIBuilder.color_secondary; }
    main_menu_btn.on_click   = () => { main_menu_btn.image.color = 'orange'; }
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