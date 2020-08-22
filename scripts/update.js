////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Nckel, update, GameLoop, InitGame
//  Filename:       update.js
//  Date:           1/10/2020
//  Description:    N2Base.js script dependant module to be included in main
//                  html file. Allows for a simpler gameloop.
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

import { DATA } from './data_loader2.js';
import { Game } from './game.js';

export { GameLoop, InitGame };

// Simplifier classes
class InitGame {
    static _f = () => {}
    static set does(f) { InitGame._f = f; }
}
class GameLoop {
    static _f = () => {}
    static set does(f) { GameLoop._f = f; }
}

// define main nickel game loop
Nickel.update = () => {

    // only update once all data is loaded
    if (!DATA.LOADED)
        return;

    // initialize game
    else
        if (!Nickel.STARTED) {
            Nickel.STARTED = true;
            InitGame._f();
        }

    // loop game
    GameLoop._f();

    // reset keys/mouse
    Game.reset_key_upped();
    Game.reset_mouse_upped();
}