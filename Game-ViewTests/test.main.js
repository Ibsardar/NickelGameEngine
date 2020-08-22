////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Main
//  Filename:       main.js
//  Date:           1/14/2020
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

// Load Views:
import { menu as vMainMenu } from '../scripts/views/main_menu.js';
import { View } from '../scripts/View.js';

// Set FPS:
Game.set_fps(60); // 60 is best

// Global Declarations: (both InitGame and GameLoop can see these)
var testImage;
var testButton;
var testLoaderA;
var testLoaderB;
var testPanelA;
var testPanelB;

// Initialize Game Components: (hidden from GameLoop)
InitGame.does = () => {

    View.next(vMainMenu);
    View.current.init();

    var bg = DATA.IMG.BG_02;
    var tank = DATA.IMG.TANK_01;
    var creep = DATA.IMG.CREEP_01;
    var load_red = DATA.IMG.HEALTHBAR_RED;
    var load_green = DATA.IMG.HEALTHBAR_GREEN;
    var upi = DATA.IMG.UP;
    var downi = DATA.IMG.DOWN;
    var lefti = DATA.IMG.LEFT;
    var righti = DATA.IMG.RIGHT;

    // helpers
    var make_img = (imgdata, pos=[0,0]) =>
        new SimpleImage(Game, imgdata.img, imgdata.w, imgdata.h, pos);
    var make_rect = (clr, size, pos, border_thickness, border_clr) =>
        new SimpleImage(Game, null, size[0], size[1], pos, clr, border_clr, border_thickness);

    // image test
    testImage = new SimpleImage(Game, tank.img, tank.w, tank.h, [250, 100], 'red', 'blue', 2);

    // button test
    var tempImage = new SimpleImage(Game, creep.img, creep.w, creep.h, [250, 100], 'red', 'blue', 2);
    testButton = new SimpleButton(Game, tempImage, creep.w, creep.h, [250, 150]);
    testButton.on_click = () => console.log('BTN > CLICKING!');
    testButton.on_hover = () => console.log('BTN > HOVERING!');
    testButton.on_release = () => {
        var rnd = Nickel.UTILITY.random_number(1,4);
        if (rnd == 1) { testPanelA.scroll_up(); console.log('scrolled up.'); }
        if (rnd == 2) { testPanelA.scroll_down(); console.log('scrolled down.'); }
        if (rnd == 3) { testPanelA.scroll_left(); console.log('scrolled left.'); }
        if (rnd == 4) { testPanelA.scroll_right(); console.log('scrolled right.'); }
        console.log('BTN > CLICKED/RELEASED!');
    }

    // h-load-bar test (with images)
    var tempUnder = make_img(load_red, [25,25]);
    var tempOver = make_img(load_green, [25,25]);
    testLoaderA = new SimpleHLoadBar(Game, tempUnder, tempOver, tempUnder.width, tempUnder.height, [50,50], true, 15);
    testLoaderA.on_change = (prev, curr) => console.log('(A) Changed by ' + (curr - prev) + '%');
    testLoaderA.on_full = (prev) => console.log('(A) Full from ' + prev + '%');

    // h-load-bar test (with rects)
    var tempUnder2 = make_rect('yellow', [128, 8], [25, 25]);
    var tempOver2 = make_rect('blue', [128, 8], [25, 25]);
    testLoaderB = new SimpleHLoadBar(Game, tempUnder2, tempOver2, tempUnder2.width, tempUnder2.height, [50,80], false, 45);
    testLoaderB.on_change = (prev, curr) => console.log('(B) Changed by ' + (curr - prev) + '%');
    testLoaderB.on_empty = (prev) => console.log('(B) Empty from ' + prev + '%');

    // panel test
    var tempBg = make_img(bg);
    testPanelA = new SimplePanel(Game, tempBg, 250, 115, [100,250], 5, 8, 2, 3, 15, 30);
    testPanelA.on_hover = () => {
        //var rpos = [Nickel.UTILITY.random_number(0,7),Nickel.UTILITY.random_number(0,4)];
        //testPanelA.unset();
        //testPanelA.set_at(testImage, rpos);
        testPanelA.unscroll();
        console.log('PNL > HOVERING!');
    }
    for (var r=0; r<testPanelA.grid.h; r++)
        for (var c=0; c<testPanelA.grid.w; c++) {
            var tempText = new SimpleText(Game, '[' + r + ',' + c + ']', 'consolas', 10, 'black', [10,10], 'center');
            testPanelA.set_at(tempText, [c,r]);
        }
    testPanelB = new SimplePanel(Game, tempBg, 100, 100, [450,250], 3, 3, 3, 3, 15, 15);
    var tempBtnUp = new SimpleButton(Game, make_img(upi), upi.w, upi.h, [10,10]);
    var tempBtnDown = new SimpleButton(Game, make_img(downi), downi.w, downi.h, [10,10]);
    var tempBtnLeft = new SimpleButton(Game, make_img(lefti), lefti.w, lefti.h, [10,10]);
    var tempBtnRight = new SimpleButton(Game, make_img(righti), righti.w, righti.h, [10,10]);
    tempBtnUp.on_release = () => { testPanelA.scroll_up(); console.log('scrolled up.'); }
    tempBtnDown.on_release = () => { testPanelA.scroll_down(); console.log('scrolled down.'); }
    tempBtnLeft.on_release = () => { testPanelA.scroll_left(); console.log('scrolled left.'); }
    tempBtnRight.on_release = () => { testPanelA.scroll_right(); console.log('scrolled right.'); }
    //tempBtnUp.on_release = () => { testPanelA.free_scroll(0,-1); console.log('free scrolled up.'); }
    //tempBtnDown.on_release = () => { testPanelA.free_scroll(0,1); console.log('free scrolled down.'); }
    //tempBtnLeft.on_release = () => { testPanelA.free_scroll(-1,0); console.log('free scrolled left.'); }
    //tempBtnRight.on_release = () => { testPanelA.free_scroll(1,0); console.log('free scrolled right.'); }
    testPanelB.set_at(tempBtnUp, [1,0]);
    testPanelB.set_at(tempBtnLeft, [0,1]);
    testPanelB.set_at(tempBtnDown, [1,2]);
    testPanelB.set_at(tempBtnRight, [2,1]);
}

// Game Loop:
GameLoop.does = () => {

    testLoaderA.percent += 1;
    testLoaderB.percent -= 1;

    if (testLoaderA.percent > 100) testLoaderA.percent = 100;
    if (testLoaderB.percent < 0) testLoaderB.percent = 0;

    View.current.update();
    testImage.update();
    testButton.update();
    testLoaderA.update();
    testLoaderB.update();
    testPanelA.update();
    testPanelB.update();
}

// Start Game:
Game.run();