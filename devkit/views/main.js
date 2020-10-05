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
import { Game } from '../../scripts/game.js';
import { GameLoop, InitGame } from '../../scripts/update.js';
import { View } from '../../scripts/View.js';
import { menu } from './menu.js';

// Module Globals
//...

// Initialize Game Components
InitGame.does = () => {

    View.next(menu).init();
}

// Game Loop:
GameLoop.does = () => {

    View.current.update();
}

// Start Game:
Game.run();