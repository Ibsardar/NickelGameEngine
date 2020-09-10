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
import { GameManager } from "./GameManager.js";

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
     * Sets the scene.
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

    static _gc_actor(trigger_delete_events=false, ...lists) {

        // remove from each list
        for (let list of lists)
            list = list.filter(
                item => item && (
                    (item instanceof Actor && !item._state != Actor.DESTROYED) || !(item instanceof Actor)
                )
            );

        Actor.delete_destroyed(trigger_delete_events);
    }

    static _gc_projectile(trigger_delete_events=false, ...lists) {

        // remove from each list
        for (let list of lists)
            list = list.filter(
                item => item && (
                    (item instanceof Projectile && !item._state != Projectile.DESTROYED) || !(item instanceof Projectile)
                )
            );

        Projectile.delete_destroyed(trigger_delete_events);
    }

    static _gc_pbs(trigger_delete_events=false, ...lists) {

        // remove from each list
        for (let list of lists)
            list = list.filter(
                item => item && (
                    (item instanceof ParticleBulletSystem && !item._state != ParticleBulletSystem.DESTROYED) ||
                    !(item instanceof ParticleBulletSystem)
                )
            );

        ParticleBulletSystem.delete_destroyed(trigger_delete_events);
    }

    static _gc_hazard(...lists) {

        // remove from each list
        for (let list of lists)
            list = list.filter(
                item => item && (
                    (item instanceof Hazard && !item._state != Projectile.DESTROYED) || !(item instanceof Hazard)
                )
            );

        Hazard.delete_destroyed();
    }

    static _gc_locomotive(...lists) {
        
        // remove from world
        if (GameManager.world)
            GameManager.world.load = GameManager.world.load.filter(
                item => item && (
                    (item instanceof Locomotive && !item.dead) || !(item instanceof Locomotive)
                )
            );

        // remove from each list
        for (let list of lists)
            list = list.filter(
                item => item && (
                    (item instanceof Locomotive && !item.dead) || !(item instanceof Locomotive)
                )
            );
    }

    static _gc_sprite(...lists) {

        // remove from world
        if (GameManager.world)
            GameManager.world.load = GameManager.world.load.filter(
                item => item && (
                    (item instanceof Sprite && !item.dead) || !(item instanceof Sprite)
                )
            );

        // remove from each list
        for (let list of lists)
            list = list.filter(
                item => item && (
                    (item instanceof Sprite && !item.dead) || !(item instanceof Sprite)
                )
            );
    }
}//end class