////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           4/15/2020
//  Description:    See below...
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

import { Game } from "../game.js";
import { Actor } from "../Actor.js";
import { Projectile } from "../projectiles/Projectile.js";
import { ParticleBulletSystem } from "../projectiles/ParticleBulletSystem.js";
import { Hazard } from "../misc/Hazard.js";

export { GarbageCollector, GarbageCollector as Garbage }; // also export an alias

/**
 * @todo
 * 
 * @class GarbageCollector
 * 
 * Static class - Manages garbage collection for many classes.
 */
class GarbageCollector {

    // Viewport of the game
    static scene;

    /**
     * Sets the scene and grid if any.
     * Sets flags to default values.
     * 
     * @param {Viewport} scene Main game
     */
    static init(scene) {

        GarbageCollector.scene = scene;
        Skeleton._scene = scene;
    }

    /**
     * Collect garbage by class reference. If no class specified,
     * collects all garbage from all available classes with default
     * parameters for each class.
     * 
     * @param {class} classref
     * @param  {...any} args 
     */
    static collect(classref=null, ...args) {

        switch (classref) {
            case null:
                GarbageCollector._gc_actor();
                GarbageCollector._gc_projectile();
                GarbageCollector._gc_pbs();
                GarbageCollector._gc_hazard();
                GarbageCollector._gc_locomotive();
                GarbageCollector._gc_sprite();
                break;
            case Actor:
                GarbageCollector._gc_actor(args);
                break;
            case Projectile:
                GarbageCollector._gc_projectile(args);
                break;
            case ParticleBulletSystem:
                GarbageCollector._gc_pbs(args);
                break;
            case Hazard:
                GarbageCollector._gc_hazard(args);
                break;
            case Locomotive:
                GarbageCollector._gc_locomotive(args);
                break;
            case Sprite:
                GarbageCollector._gc_sprite(args);
                break;
            default:
                console.error('ERROR: GarbageCollector>collect: class reference '+classref+'not found.');
        }
    }

    // 
    // REMEMBER!!!   GAMEMANAGER WILL HANDLE GC CONDITIONS, AND GARBAGECOLLECTOR WILL HANDLE ACTUAL GC OPS !!!
    //     

    static _gc_actor() {/**@todo */}

    static _gc_projectile() {/**@todo */}

    static _gc_pbs() {/**@todo */}

    static _gc_hazard() {/**@todo */}

    static _gc_locomotive() {/**@todo */}

    static _gc_sprite() {/**@todo */}

}//end class