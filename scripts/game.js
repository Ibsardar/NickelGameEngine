////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Game, Viewport
//  Filename:       game.js
//  Date:           6/5/2019
//  Description:    N2Base.js script dependant module to be included in main
//                  html file. Contains the game's viewport details.
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

export { Game };

// > Game
var Game = new Viewport('main');
Game.toggle_image_blur();
Game.set_bg_color("#ffaa22");
Game.set_size(1280, 720); // 720p HD
Game.canvas.oncontextmenu = () => false; // disable right click menu