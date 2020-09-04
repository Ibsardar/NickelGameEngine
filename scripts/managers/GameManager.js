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

import { Skeleton } from "../Skeleton.js";
import { Projectile } from "../projectiles/Projectile.js";
import { Bullet } from "../projectiles/Bullet.js";
import { StickyBullet } from "../projectiles/StickyBullet.js";
import { SmartBullet } from "../projectiles/SmartBullet.js";
import { ParticleBulletSystem } from "../projectiles/ParticleBulletSystem.js";
import { GlowPBS } from "../projectiles/GlowPBS.js";
import { Fire } from "../projectiles/Fire.js";
import { Actor } from "../Actor.js";
import { Game } from "../game.js";

export { GameManager, GameManager as GaMa }; // also export an alias

/**
 * @todo make user input simpler (keys/scroll?)
 * 
 * @class GameManager
 * 
 * Static class - holds/manages the current game details in addition
 * to the Nickel object and Viewport class.
 */
class GameManager {

    // Viewport of the game
    static scene;

    // Grid (if any) that the manager updates everything in
    static _world;

    // max # of projectiles per group until garbage
    // collection deletes all dead projectiles
    static max_projectiles_per_group_until_gc;

    // max # of particles per group until garbage
    // collection deletes all dead particles
    static max_particles_per_group_until_gc;

    // if true, triggers delete events
    static trigger_delete_events_flag;

    // list of groups to be updated
    static active_group_name_list = [];

    // list of groups to update if update type is WHITELIST
    // list of groups to not update if update type is BLACKLIST
    // has no effect if update type is UNRESTRICTED
    static _groups = [];

    // how is updating restricted? WHITELIST, BLACKLIST, or UNRESTRICTED?
    // (see GameManager constants)
    static _update_type = 0; // default UNRESTRICTED

    /**
     * Sets the scene.
     * Sets flags to default values.
     * 
     * @param {Viewport} scene Main game
     */
    static init(scene) {

        GameManager.scene = scene;
        Skeleton._scene = scene;

        GameManager.max_projectiles_per_group_until_gc = Nickel.DEBUG ? 10 : 100;
        GameManager.max_particles_per_group_until_gc = Nickel.DEBUG ? 50 : 1000;
        GameManager.trigger_delete_events_flag = Nickel.DEBUG ? true : false;
    }

    /**
     * Runs handles for every base class that has handles.
     * Runs garbage collection.
     * Runs everything inside Grid if it is set.
     */
    static handle() {

        // update world instead if set
        if (GameManager._world)
        
            // grid
            GameManager._world.update();

        // if no world available, update into the raw canvas
        else

            GameManager._handle();
    }

    /**
     * Runs handles for every base class that has handles.
     * Runs garbage collection.
     */
    static _handle() {

        // actors
        Actor.handle_triggers();

        // projectiles
        Projectile.handle_triggers();
        Bullet.handle_triggers();
        StickyBullet.handle_triggers();
        SmartBullet.handle_triggers();

        // particles
        ParticleBulletSystem.handle_triggers();
        GlowPBS.handle_triggers();
        Fire.handle_triggers();

        // clean up
        GameManager.garbage_collection();

        // update
        GameManager.update();
    }

    /**
     * Updates particles, projectiles, actors, etc... via static groups
     */
    static update() {

        if (GameManager._update_type == GameManager.UNRESTRICTED) {

            // static class update calls
            Projectile.update_all();
            ParticleBulletSystem.update_all();
            Actor.update_all();

        } else if (GameManager._update_type == GameManager.WHITELIST) {

            // static class update calls
            Projectile.update_only(GameManager._groups);
            ParticleBulletSystem.update_only(GameManager._groups);
            Actor.update_only(GameManager._groups);

        } else if (GameManager._update_type == GameManager.BLACKLIST) {

            // static class update calls
            Projectile.update_except(GameManager._groups);
            ParticleBulletSystem.update_except(GameManager._groups);
            Actor.update_except(GameManager._groups);
        }
    }

    /**
     * @todo implement an efficient dead_count getter (just record additions and subtractions of object so you don't have to re-count every frame)
     * Collects garbage i.e. remove dead things.
     */
    static garbage_collection() {

        if (Projectile.count > Projectile.group_count * GameManager.max_projectiles_per_group_until_gc) {
            if (Nickel.DEBUG) console.log('Projectile garbage collection triggered.');
            SmartBullet.delete_destroyed(GameManager.trigger_delete_events_flag);
        }

        if (ParticleBulletSystem.particle_count > ParticleBulletSystem.group_count * GameManager.max_particles_per_group_until_gc) {
            if (Nickel.DEBUG) console.log('ParticleBulletSystem garbage collection triggered.');
            ParticleBulletSystem.delete_destroyed(GameManager.trigger_delete_events_flag);
        }
    }

    /**
     * Destroys everything including projectiles, particles,
     * actors, the world (if set) and everything in it, etc...
     */
    static destroy_all() {

        GameManager._world = null;
        Fire.reset();
        SmartBullet.reset();
        Actor.reset();
        Skeleton.reset();
    }

    /**
     * Resets all the static variables.
     */
    static reset() {

        GameManager.scene = null;
        GameManager._world = null;
        GameManager.max_projectiles_per_group_until_gc = null;
        GameManager.max_particles_per_group_until_gc = null;
        GameManager.trigger_delete_events_flag = null;
        GameManager.active_group_name_list = [];
        GameManager._groups = [];
        GameManager._update_type = 0;
    }

    /**
     * Set groups to update only/except/all. This will affect the
     * updating of Actors, Projectiles, and articleBulletSystems.
     * 
     * @param {String[]} groups list of group names to include/exclude
     * @param {String} type 'all' to allow all groups, 'only' to allow certain, or 'except' to restrict certain
     */
    static set_groups(groups=[], type='all') {

        GameManager._groups = groups;
        if (type == 'only') GameManager._update_type = GameManager.WHITELIST;
        else if (type == 'except') GameManager._update_type = GameManager.BLACKLIST;
        else GameManager._update_type = GameManager.UNRESTRICTED;
    }

    /**
     * Grid Object representing the game's worldspace.
     * 
     * @type {Grid|null} Grid or null
     */
    static get world() { return GameManager._world; }
    static set world(grid) {
        if (grid instanceof Grid) {
            GameManager._world = grid;
            var len = GameManager._world.get_load().length;
            if (len)
                console.warn('WARNING: GameManager>set world: Grid is drawing on top of '+len+' objects already in the world.')
            GameManager._world.load_updater({ update : GameManager._handle });
        } else if (!grid)
            GameManager._world = null;
        else
            console.error('ERROR: GameManager>set world: expecting instance of Grid (or falsey to unset).');
    }

    /**
     * List of group names to (only/not) update.
     * 
     * @type {String[]} list of group names
     */
    static get groups() { return GameManager._groups; }

    /**
     * Value representing current updating behaviour constant.
     * - 0 : UNRESTRICTED
     * - 1 : WHITELIST
     * - 2 : BLACKLIST
     * 
     * @type {Number} updating behaviour constant
     */
    static get update_type() { return GameManager._update_type; }

    /// (Static Constant) Group updating types.
    static get UNRESTRICTED ()  { return 0; }
    static get WHITELIST    ()  { return 1; }
    static get BLACKLIST    ()  { return 2; }

}//end class