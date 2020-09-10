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

import { Bullet } from "../projectiles/Bullet.js";

export { Hazard };

/**
 * @class Hazard
 * 
 * Hazards are like bullets but typically will not have any kind of movement.
 */
class Hazard extends Bullet {

    /**
     * Default constructor.
     */
    constructor(damage_armor_then_health=0, damage_armor_only=0, damage_health_only=0, effects=[]) {
        
        this._dmg_normal = damage_armor_then_health;
        this._dmg_break = damage_armor_only;
        this._dmg_pierce = damage_health_only;
        this._effects = effects;
    }

    /**
     * Static function: removes all targets, projectiles, and their
     * quadtree for a certian group. Does not trigger delete event by
     * default. Does not internally destroy projectiles by default.
     * * note: will delete non-Hazard projectiles in the given group
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // delete from bullet list
        Bullet.delete_group(group, trigger);

        // delete hazard list
        delete Hazard._p_hazards[group];
    }

    /**
     * Static function: removes all destroyed hazards ONLY. Also
     * removes empty groups. Does not trigger delete events at all.
     * note: underlying projectiles still remain in Projectiles class.
     *       Call Projectile.delete_destroyed to remove them.
     */
    static delete_destroyed() {

        // delete from this class
        var ps = Hazard._p_hazards;

        // remove empty groups
        for (var i in ps) 
            if (!ps[i] || !ps[i].length)
                delete ps[i];
        
        // remove dead objects
        for (var g in ps)
            ps[g] = ps[g].filter(p => p && p._state != Projectile.DESTROYED);
    }
    
    /**
     * Static property: Number of hazards.
     * (includes destroyed, excludes deleted)
     * 
     * @type {Number} hazard count
     */
    static get count() {
        var c = 0;
        for (var g in this._p_hazards)
            c += this._p_hazards[g].length;
        return c;
    }

    /**
     * @overrides parent class function.
     * Resets all static data to the default values.
     */
    static reset() {

        Bullet.reset();
        Hazard._p_hazards = {};
    }

    static _p_hazards = {};
    _dmg_normal; // damage to armor, then health
    _dmg_pierce; // damage to health only
    _dmg_break; // damage to armor only
    _effects = []; // effects applied on hit

}//end class