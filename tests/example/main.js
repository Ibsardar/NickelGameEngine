////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Main
//  Filename:       main.js
//  Date:           12/9/2020
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
import { Game } from '../scripts/game.js';
import { GameLoop, InitGame } from '../../scripts/update.js';
import { GameManager } from '../../scripts/managers/GameManager.js';

// Set FPS:
Game.set_fps(60); // 60 is best

// Globals
var stuff;

// Initialize Game Components
InitGame.does = () => {

    Nickel.DEBUG = true;
    GameManager.init(Game);

    // test here...
}

// Game Loop:
GameLoop.does = () => {

    Game.clear();

    // update stuff here...

    GameManager.handle();
}

// Start Game:
Game.run();