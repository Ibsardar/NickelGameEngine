////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       View, Menu
//  Filename:       menu.js
//  Date:           8/20/2019
//  Description:    Scene that presents different options in main menu.
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

// views
import { credits as credits_page } from '../views/credits.js';

export { menu }

var menu = new View();

// globals
var panel_bg;

menu.game_init = () => {

    // helpers
    var _mkimg = (a) => new SimpleImage(Game, a.img, a.w, a.h, [0,0]);
    var _mkbtn = (a, wp, hp) => new SimpleButton(Game, _mkimg(a), (wp ? wp*a.w : a.w), (hp ? hp*a.h : a.h), [0,0]);
    var _chbtn = (b, a) => b.image.set_image(a.img, a.w, a.h);

    // bg
    var rnd_bg = Nickel.util.r_elem([
        DATA.IMG.BGWH_BLUR_01, DATA.IMG.BGWH_BLUR_02, DATA.IMG.BGWH_BLUR_03,
        DATA.IMG.BGWH_BLUR_04, DATA.IMG.BGWH_BLUR_05
    ]);
    panel_bg = new SimplePanel(Game, _mkimg(rnd_bg), 1280, 720, [0,0], 8, 4, 8, 4, 25, 10);

    // title
    var title = _mkimg(DATA.IMG.TITLE_01);

    // menu btns
    var skirmish = _mkbtn(DATA.IMG.MENU_BTN_SKIRMISH, 0.5, 0.5);
    var editor = _mkbtn(DATA.IMG.MENU_BTN_EDITOR, 0.5, 0.5);
    var settings = _mkbtn(DATA.IMG.MENU_BTN_SETTINGS, 0.5, 0.5);
    var credits = _mkbtn(DATA.IMG.MENU_BTN_CREDITS, 0.5, 0.5);
    var quit = _mkbtn(DATA.IMG.MENU_BTN_QUIT, 0.75, 0.75);

    // btn functionality
    var random_sound = () => Nickel.util.r_elem([
        //DATA.SND.HOVER_01, DATA.SND.HOVER_02,
        //DATA.SND.HOVER_03, DATA.SND.HOVER_04,
        DATA.SND.HOVER_05
    ]);
    skirmish.on_enter = () => {
        _chbtn(skirmish, DATA.IMG.MENU_BTN_H_SKIRMISH);
        random_sound().play();
    }
    skirmish.on_leave = () => {
        _chbtn(skirmish, DATA.IMG.MENU_BTN_SKIRMISH);
    }
    skirmish.on_release = () => {
        //
    }
    editor.on_enter = () => {
        _chbtn(editor, DATA.IMG.MENU_BTN_H_EDITOR);
        random_sound().play();
    }
    editor.on_leave = () => {
        _chbtn(editor, DATA.IMG.MENU_BTN_EDITOR);
    }
    editor.on_release = () => {
        //
    }
    settings.on_enter = () => {
        _chbtn(settings, DATA.IMG.MENU_BTN_H_SETTINGS);
        random_sound().play();
    }
    settings.on_leave = () => {
        _chbtn(settings, DATA.IMG.MENU_BTN_SETTINGS);
    }
    settings.on_release = () => {
        //
    }
    credits.on_enter = () => {
        _chbtn(credits, DATA.IMG.MENU_BTN_H_CREDITS);
        random_sound().play();
    }
    credits.on_leave = () => {
        _chbtn(credits, DATA.IMG.MENU_BTN_CREDITS);
    }
    credits.on_release = () => {
        View.next(credits_page).send(rnd_bg).init();
    }
    quit.on_enter = () => {
        _chbtn(quit, DATA.IMG.MENU_BTN_H_QUIT);
        random_sound().play();
    }
    quit.on_leave = () => {
        _chbtn(quit, DATA.IMG.MENU_BTN_QUIT);
    }
    quit.on_release = () => {
        location.reload();
    }

    // logo
    var logo = _mkimg(DATA.IMG.LOGO_02);
    logo.width *= 0.75;
    logo.height *= 0.75;

    // panel setup
    panel_bg.set_at(title, [0,1]);
    panel_bg.set_at(skirmish, [0,3]);
    panel_bg.set_at(editor, [0,4]);
    panel_bg.set_at(settings, [0,5]);
    panel_bg.set_at(credits, [0,6]);
    panel_bg.set_at(quit, [0,7]);
    panel_bg.set_at(logo, [2,3]);

    // game setup
    Game.set_bg_color('black');
}

menu.game_loop = () => {

    Game.clear();

    panel_bg.update();
}