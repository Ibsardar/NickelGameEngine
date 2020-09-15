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
import { Hazard } from "../misc/Hazard.js";
import { GarbageCollector } from "./GarbageCollector.js";

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

    /** Viewport of the game */
    static scene;

    // Grid (if any) that the manager updates everything in
    static _world;

    /** max # of projectiles per group until garbage
     * collection deletes all dead projectiles
     */
    static max_projectiles_per_group_until_gc;

    /** max # of particles per group until garbage
     * collection deletes all dead particles
     */
    static max_particles_per_group_until_gc;

    /** max # of actors per group until garbage
     * collection deletes all dead actors
     */
    static max_actors_per_group_until_gc;

    /** max # of world objects per group until garbage
     *  collection deletes all types of dead objects
     */
    static max_world_objects_until_gc;

    /** if true, triggers delete events */
    static trigger_delete_events_flag;

    /** list of groups to be updated */
    static active_group_name_list = []; // NOT USED

    /** Determines max wait time (ms) for gc to wait for any gc operation until it is triggered */
    static max_gc_wait_time;

    /** Condition function which triggers a custom garbage collection */
    static custom_gc_collect_condition = () => {};

    /** Filter function which determines when an item in a custom_gc_list is not garbage */
    static custom_gc_garbage_filter = (item) => {};

    /** List of references to lists for custom garbage collection */
    static custom_gc_lists = [];

    /** If enabled, regularly calls custom garbage collection (regardless of collect condition function) */
    static continuous_custom_gc_enabled = false;

    // list of groups to update if update type is WHITELIST
    // list of groups to not update if update type is BLACKLIST
    // has no effect if update type is UNRESTRICTED
    static _groups = [];

    // how is updating restricted? WHITELIST, BLACKLIST, or UNRESTRICTED?
    // (see GameManager constants)
    static _update_type = 0; // default UNRESTRICTED

    // Garbage collection timer
    static _gc_timer;

    /**
     * Sets the scene.
     * Sets flags to default values.
     * 
     * @param {Viewport} scene Main game
     */
    static init(scene) {

        GameManager.scene = scene;
        Skeleton._scene = scene;
        GarbageCollector.init(scene);
        GameManager._gc_timer = new SimpleTimer();

        GameManager.max_projectiles_per_group_until_gc = Nickel.DEBUG ? 10 : 100;
        GameManager.max_particles_per_group_until_gc = Nickel.DEBUG ? 100 : 1000;
        GameManager.max_actors_per_group_until_gc = Nickel.DEBUG ? 5 : 50;
        GameManager.max_world_objects_until_gc = Nickel.DEBUG ? 25 : 250;
        GameManager.trigger_delete_events_flag = Nickel.DEBUG ? true : false;
        GameManager.max_gc_wait_time = Nickel.DEBUG ? 60000 : 300000; // 60s or 5min

        GameManager._gc_timer.set_alarm(GameManager.max_gc_wait_time);
        GameManager._gc_timer.on_alarm(() => {
            if (Nickel.DEBUG) console.log("GC timer is up, collecting all garbage. GC timer restarted.");
            GarbageCollector.collect(null, GameManager.trigger_delete_events_flag); // collect all
            if (GameManager.continuous_custom_gc_enabled) {
                if (Nickel.DEBUG) console.log("Also collecting all custom garbage.");
                GarbageCollector.custom(GameManager.custom_gc_garbage_filter, GameManager.custom_gc_lists); // collect custom
            }
            GameManager._gc_timer.restart();
        });
        GameManager._gc_timer.start();
    }

    /**
     * Runs handles for every base class that has handles.
     * Runs garbage collection.
     * Runs everything inside Grid if it is set.
     */
    static handle() {

        // clean up (independent of all canvases)
        GameManager.garbage_collection();

        // update world if set
        if (GameManager._world) {
        
            // grid canvas
            GameManager._world.update();

        // if no world available, update into the raw canvas
        } else {
            
            // main canvas
            GameManager._handle();
        }
    }

    /**
     * Runs handles for every base class that has handles.
     * Updates some static managed classes.
     * Does NOT run garbage collection.
     */
    static _handle() {

        // hazards
        Hazard.handle_triggers();

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
     * Collects garbage i.e. removes dead things.
     */
    static garbage_collection() {

        if (Projectile.count > Projectile.number_of_groups * GameManager.max_projectiles_per_group_until_gc) {
            if (Nickel.DEBUG) console.log('Projectile garbage collection triggered. GC timer restarted.');
            GarbageCollector.collect(Projectile, GameManager.trigger_delete_events_flag);
            GarbageCollector.collect(Hazard);
            GameManager._gc_timer.restart();
        }  

        if (ParticleBulletSystem.particle_count > ParticleBulletSystem.number_of_groups * GameManager.max_particles_per_group_until_gc) {
            if (Nickel.DEBUG) console.log('ParticleBulletSystem garbage collection triggered. GC timer restarted.');
            GarbageCollector.collect(ParticleBulletSystem, GameManager.trigger_delete_events_flag);
            GameManager._gc_timer.restart();
        }   

        if (Actor.count > Actor.number_of_groups * GameManager.max_actors_per_group_until_gc) {
            if (Nickel.DEBUG) console.log('Actor garbage collection triggered. GC timer restarted.');
            GarbageCollector.collect(Actor, GameManager.trigger_delete_events_flag);
            GameManager._gc_timer.restart();
        }

        if (GameManager._world.load.length > GameManager.max_world_objects_until_gc) {
            if (Nickel.DEBUG) console.log('World garbage collection triggered. GC timer restarted.');
            GarbageCollector.collect(null, GameManager.trigger_delete_events_flag); // collect all
            GameManager._gc_timer.restart();
        }

        if (GameManager.custom_gc_collect_condition()) {
            if (Nickel.DEBUG) console.log('Custom garbage collection triggered. GC timer restarted.');
            GarbageCollector.custom(GameManager.custom_gc_garbage_filter, GameManager.custom_gc_lists); // collect custom
            GameManager._gc_timer.restart();
        }

        GameManager._gc_timer.update();
    }

    /**
     * Destroys everything including projectiles, particles,
     * actors, the world (if set) and everything in it, etc...
     */
    static destroy_all() {

        GameManager._world = null;
        Fire.reset();
        SmartBullet.reset(); // deep reset
        Hazard.reset(false); // shallow reset
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
        GameManager.max_actors_per_group_until_gc = null;
        GameManager.max_world_objects_until_gc = null;
        GameManager.trigger_delete_events_flag = null;
        GameManager.active_group_name_list = [];
        GameManager._groups = [];
        GameManager._update_type = 0;
        GameManager.max_gc_wait_time = null;
        GameManager._gc_timer = null;
        GameManager.custom_gc_collect_condition = () => {};
        GameManager.custom_gc_garbage_filter = (item) => {};
        GameManager.custom_gc_lists = [];
        GameManager.continuous_custom_gc_enabled = false;
    }

    /**
     * Sets the collect condition function that determines custom
     * gc calls. Sets the garbage filter function. Sets the
     * custom list of lists to collect custom garbage from.
     * 
     * ***Note: ONLY 1 CUSTOM GC CONFIGURATION IS AVAILABLE
     *          SO PUT ALL YOUR CUSTOM STUFF IN ONE FUNCTION!***
     * 
     * *Sub-Note: If continuous_custom_gc_enabled is true, these
     *            paramters will also be called along with the
     *            default frequency-based gc calls. To disable,
     *            simply set continuous_custom_gc_enabled to false.*
     * 
     * @param {GameManager.custom_gc_collect_condition} collect 
     * @param {GameManager.custom_gc_garbage_filter} filter 
     * @param  {...any} lists 
     */
    static set_conditional_custom_gc(collect=GameManager.custom_gc_collect_condition,
        filter=GameManager.custom_gc_garbage_filter,...lists) {
        
        GameManager.custom_gc_collect_condition = collect;
        GameManager.custom_gc_garbage_filter = filter;
        GameManager.custom_gc_lists = lists;
    }

    /**
     * Sets the garbage filter function. Sets the custom
     * list of lists to collect custom garbage from. Enables
     * frequency based gc (i.e. custom gc will also be called
     * along with default gc, based on gc call frequency)
     * 
     * ***Note: ONLY 1 CUSTOM GC CONFIGURATION IS AVAILABLE
     *          SO PUT ALL YOUR CUSTOM STUFF IN ONE FUNCTION!***
     * 
     * @param {GameManager.custom_gc_garbage_filter} filter 
     * @param  {...any} lists 
     */
    static set_timed_custom_gc(filter=GameManager.custom_gc_garbage_filter, ...lists) {

        GameManager.continuous_custom_gc_enabled = true;
        GameManager.custom_gc_garbage_filter = filter;
        GameManager.custom_gc_lists = lists;
    }

    /**
     * Reset all custom garbage collection configuration.
     */
    static reset_custom_gc() {

        GameManager.custom_gc_collect_condition = () => {};
        GameManager.custom_gc_garbage_filter = (item) => {};
        GameManager.custom_gc_lists = [];
        GameManager.continuous_custom_gc_enabled = false;
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