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
import { Game } from '../scripts/game.js';
import { GameLoop, InitGame } from '../../../scripts/update.js';
import { GameManager } from '../../../scripts/managers/GameManager.js';
import { SimpleButton } from '../../../engine/classes/SimpleButton.js';

// Set FPS:
Game.set_fps(60); // 60 is best

// Globals
var btn;

// Initialize Game Components
InitGame.does = () => {

    Nickel.DEBUG = true;
    GameManager.init(Game);

    btn = new SimpleButton(Game, /** @todo: SimpleImage */, 20, 40, [200,150]);
}

// Game Loop:
GameLoop.does = () => {

    Game.clear();

    // update stuff here...

    GameManager.handle();
}

// Start Game:
Game.run();