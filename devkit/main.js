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
import { DATA } from '../scripts/data_loader2.js';
import { GameLoop, InitGame } from '../scripts/update.js';
import { GameManager } from '../scripts/managers/GameManager.js';

// Set FPS:
Game.set_fps(60); // 60 is best

// Globals
//var GameGrid;
load_limb = (img) => {

    
}

// Initialize Game Components
InitGame.does = () => {

    Nickel.DEBUG = true;
    GameManager.init(Game, /** @param world_params=null - auto-creates a grid with the input options if set*/); // <-- this is best
    Game.set_bg_color("#adadad");

    GameGrid = new Grid(); // MAJOR PROBLEM: NEED TO UPDATE GAMEMANAGER STUFF (I.E. _projectiles, _actors, etc) IN Grid OBJECT!!!
    GameManager.world = new Grid(); // something like this would be nice... (it's a get/set property)
}

// Game Loop:
GameLoop.does = () => {

    Game.clear();
    GameGrid.update();

    GameManager.handle(); // actually put this in a callback and replace update_more in the created grid
}

// Start Game:
Game.run();