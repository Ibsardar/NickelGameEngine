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
import { Limb } from '../scripts/Limb.js';
import { Skeleton } from '../scripts/Skeleton.js';
import { Actor } from '../scripts/Actor.js';
import { NecronWarrior } from '../scripts/actors/NecronWarrior.js';
import { Bullet } from '../scripts/projectiles/Bullet.js';
import { GameManager } from '../scripts/managers/GameManager.js';

// Set FPS:
Game.set_fps(60); // 60 is best

// Globals
var sBody, sArm, sForearm;
var lBody, lArm, lForearm;
var skTest;
var akTest;
var akTest2;
var akNecron;

// Initialize Game Components
InitGame.does = () => {

    GameManager.init(Game);

    // lBody = new Limb(Game, DATA.IMG.CREEP_01, true, 'above', {}) // body
    //         .attach(new Limb(Game, DATA.IMG.HEALTHBAR_RED, true, 'below', {pos:[0,4], rot:-45}, [0,0]) // arm
    //             .attach(new Limb(Game, DATA.IMG.HEALTHBAR_GREEN, true, 'above', {pos:[96,0], rot:90}, [0,0]))); // forearm
    // skTest = new Skeleton(lBody);
    // akTest = new Actor(Game, {
    //     'skeleton' : skTest,
    //     'targets' : [],
    //     'group' : 'test-1',
    //     'on_create' : () => console.log('Created akTest!'),
    //     'on_hit' : () => console.log('Collision on akTest!'),
    //     'on_destroyed' : () => console.log('Destroyed akTest!'),
    //     'on_delete' : () => console.log('Delete akTest!'),
    // });

    // akTest.position = [250,250];

    // akTest2 = akTest.clone();

    // akTest2.on('create', () => console.log('Created akTest2!!!'));
    // akTest2.on('hit', () => console.log('Collision on akTest2!!!'));
    // akTest2.on('destroy', () => console.log('Destroyed akTest2!!!'));
    // akTest2.on('delete', () => console.log('Deleted akTest2!!!'));
    // akTest2.position = [400,250];

    // akTest2.update_more = () => {
    //     var p = akTest2.position;
    //     akTest2.position = [p[0] + 1, p[1]];
    // }

    // var targets = [];
    // targets.push(...akTest.skeleton.limbs);
    // targets.push(...akTest2.skeleton.limbs);
    // Actor.set_targets(targets, 'test-1');

    //Actor.delete_group('test-1');

    akNecron = new NecronWarrior('necrons', 'A');
    akNecron.position = [75,175];

    // junk
    //Nickel.GLOBALS.Game = Game;
    Nickel.GLOBALS.akNecron = akNecron;
    Nickel.GLOBALS.NecWar = NecronWarrior;
    //Nickel.GLOBALS.akTest = akTest;
    //Nickel.GLOBALS.akTest2 = akTest2;
    //Nickel.GLOBALS.Actor = Actor;
    //Nickel.GLOBALS.Bullet = Bullet;
}

// Game Loop:
GameLoop.does = () => {

    Game.clear();

    //akTest.update();
    //akTest2.update();
    akNecron.update();

    Actor.handle_triggers(); // should be taken care of in GameManager
    Bullet.handle_triggers(); // should be taken care of in GameManager
}

// Start Game:
Game.run();