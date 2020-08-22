////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Main
//  Filename:       main.js
//  Date:           4/7/2020
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
import { View } from '../scripts/View.js';

// Load Views:
import { menu as main_menu_page } from '../scripts/views/main_menu.js';

// Set FPS:
Game.set_fps(60); // 60 is best

// Globals
//...

// Initialize Game Components
InitGame.does = () => {

    View.next(main_menu_page).init();

}

// Game Loop:
GameLoop.does = () => {

    View.current.update();

}

// Start Game:
Game.run();