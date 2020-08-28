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
import { ParticleBulletSystem } from "../projectiles/ParticleBulletSystem.js";
import { GlowPBS } from "../projectiles/GlowPBS.js";
import { Actor } from "../Actor.js";

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

    /**
     * Sets the scene.
     * Sets flags to default values.
     * 
     * @param {Viewport} scene Main game
     */
    static init(scene) {

        GameManager.scene = scene;
        Skeleton._scene = scene;

        GameManager.max_projectiles_per_group_until_gc = 500;
        GameManager.max_particles_per_group_until_gc = 1000;
        GameManager.trigger_delete_events_flag = true;
    }

    /**
     * Runs handles for every base class that has handles.
     * Runs garbage collection.
     */
    static handle() {

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

        // projectiles
        Projectile.update_all();

        // particles
        ParticleBulletSystem.update_all();

        // actors
        Actor.update_all();
    }

    /**
     * Collects garbage i.e. remove dead things.
     */
    static garbage_collection() {

        if (Projectile.count >= Projectile.group_count * GameManager.max_projectiles_per_group_until_gc)
            SmartBullet.delete_destroyed(GameManager.trigger_delete_events_flag);

        if (ParticleBulletSystem.particle_count >= ParticleBulletSystem * GameManager.max_particles_per_group_until_gc)
            ParticleBulletSystem.delete_destroyed(GameManager.trigger_delete_events_flag);
    }

}//end class