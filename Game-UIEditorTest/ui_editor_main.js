////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       UI, Editor, Main
//  Filename:       ui_editor_main.js
//  Date:           10/8/2019
//  Description:    Main script dependant module to be included towards the end
//                  of the html file. Contains UI Editor's game loop
//                  implementation.
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
//  Copyright (c) 2019 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

// load modules
import { Game } from '../scripts/game.js';
import { DATA } from '../scripts/data_loader2.js';

Game.set_fps(60); // 60 is best

//DATA.SND.COIN.play();

//var Tilemap = new Grid(DATA.GRID);

var game_started = false;

Nickel.update = function() {

    // only update once all data is loaded
    if (!DATA.LOADED)
        return;
    else {
        if (!game_started) {
            game_started = true;
            DATA.SND.START.play();
        }
    }
   
    Game.clear();

    //Tilemap.update();

}

// Start Game:
Game.run();