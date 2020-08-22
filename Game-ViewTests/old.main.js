////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Main
//  Filename:       main.js
//  Date:           1/10/2020
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

// load modules
import { Game } from '../scripts/game.js';
import { DATA } from '../scripts/data_loader2.js';

// load Views
import { menu as vMenu } from '../scripts/views/menu.js';
import { View } from '../scripts/View.js';

// pre-init
View.next(vMenu);

Game.set_fps(60); // 60 is best

var game_started = false;

var testImage;
var testButton;

// TODO:   TRY THIS SAME THING BUT USE 'update.js'   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Nickel.update = function() {

    // only update once all data is loaded
    if (!DATA.LOADED)
        return;
    else
        if (!game_started) {
            game_started = true;

            // INIT WITH LOADED DATA BELOW HERE...

            var tank = DATA.IMG.TANK_01;
            var creep = DATA.IMG.CREEP_01;

            testImage = new SimpleImage(Game, tank.img, tank.w, tank.h, [250, 100], 'red', 'blue', 2);

            var tempImage = new SimpleImage(Game, creep.img, creep.w, creep.h, [250, 100], 'red', 'blue', 2);
            testButton = new SimpleButton(Game, tempImage, creep.w, creep.h, [250, 150]);
            testButton.on_click = () => console.log('BTN > CLICKING!');
            testButton.on_hover = () => console.log('BTN > HOVERING!');
            testButton.on_release = () => console.log('BTN > CLICKED/RELEASED!');
        }

    View.current.update();
    testImage.update();
    testButton.update();

    Game.reset_mouse_upped();
}

// Start Game:
Game.run();