////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       View, Settings
//  Filename:       settings.js
//  Date:           12/26/2019
//  Description:    Scene that presents different options.
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

import { DATA } from '../data_loader2.js';
import { Game } from '../game.js';
import { View } from '../View.js';

export { credits }

var credits = new View();

// globals
var img_bg_pre;
var panel_bg;

credits.game_init = () => {

    // helpers
    var _mkimg = (a) => new SimpleImage(Game, a.img, a.w, a.h, [0,0]);

    // bg
    var received = credits.receive();
    var bg = received[0];
    img_bg_pre = _mkimg(bg);
    panel_bg = new SimplePanel(Game, _mkimg(DATA.IMG.BG_DARK50), 1280, 720, [0,0], 8, 4, 8, 4, 25, 10);

    // title
    var title = _mkimg(DATA.IMG.TITLE_01);

    // credit
    var credit1 = new SimpleText(Game, 'Design: Ibrahim Sardar', 'pt sans', 32, 'white', [0,0], 'center', 700);
    var credit2 = new SimpleText(Game, 'Code: Ibrahim Sardar', 'pt sans', 32, 'white', [0,0], 'center', 700);
    var credit3 = new SimpleText(Game, 'Art: Ibrahim Sardar', 'pt sans', 32, 'white', [0,0], 'center', 700);
    var credit4 = new SimpleText(Game, 'Open Source: textcraft.net, craftpix.net', 'pt sans', 32, 'white', [0,0], 'center', 700);
    credit1.set_outline('black', 1);
    credit2.set_outline('black', 1);
    credit3.set_outline('black', 1);
    credit4.set_outline('black', 1);

    // btn
    var back = new SimpleButton(Game, _mkimg(DATA.IMG.MENU_BTN_BACK), DATA.IMG.MENU_BTN_BACK.w * 0.75, DATA.IMG.MENU_BTN_BACK.h * 0.75);
    back.on_enter = () => {
        back.image.set_image(DATA.IMG.MENU_BTN_H_BACK.img);
    }
    back.on_leave = () => {
        back.image.set_image(DATA.IMG.MENU_BTN_BACK.img);
    }
    back.on_release = () => {
        back.image.set_image(DATA.IMG.MENU_BTN_H_BACK.img);
        View.previous(credits)
    }

    // panel setup
    panel_bg.set_at(title, [0,1]);
    panel_bg.set_at(credit1, [2,1]);
    panel_bg.set_at(credit2, [2,2]);
    panel_bg.set_at(credit3, [2,3]);
    panel_bg.set_at(credit4, [2,4]);
    panel_bg.set_at(back, [0,7]);

    // game setup
    Game.set_bg_color('black');
}

credits.game_loop = () => {

    Game.clear();

    img_bg_pre.update();
    panel_bg.update();
}