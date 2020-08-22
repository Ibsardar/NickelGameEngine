////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Bullet, Projectile
//  Filename:       Bullet.js
//  Date:           6/5/2019
//  Description:    Class that describes a bullet projectile.
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

import { Projectile } from "./Projectile.js";

export { Bullet };

/**
 * @class Bullet
 * 
 * Describes a bullet of various properties.
 */
class Bullet extends Projectile {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param  {object} bdata data object of bullet parameters.
     * - > .sprite_data : data for Sprite creation
     * - > .bounds : (optional) data for projectile bounds relative to canvas
     *   > - .left : left bound
     *   > - .right : right bound
     *   > - .top : top bound
     *   > - .bottom : bottom bound
     * - > .script_effect : (optional) post update function; called every frame
     * - > .targets : list of collidable targets
     * - > .group : group id of targets and projectiles
     * - > .on_create : (optional) create event trigger function
     * - > .on_hit : (optional) collision event trigger function
     * - > .on_destroyed : (optional) destroy event trigger function
     * - > .on_delete : (optional) delete event trigger function
     * 
     * Bullet specific params:
     * - > .particle_sys : (optional) ParticleSystem object that will emit from behind the bullet
     * - > .maxtime : maximum time (ms) between creation and destruction
     * - > .health : health amount
     * - > .snd_create : (optional) sound effect on creation
     * - > .snd_hit : (optional) sound effect on target hit
     * - > .snd_destroy : (optional) sound on death
     */
    constructor(scene, bdata) {
        super(scene, bdata);

        // reset state (init not done yet)
        this._state = Bullet.WAITING_INIT;

        // set mandatory vars
        this._life_timer = new SimpleTimer();
        this._life_timer.set_alarm(bdata.maxtime);
        this._hp = bdata.health;

        // set optional vars
        this._ps = bdata.particle_sys;
        this._snd_create = bdata.snd_create;
        this._snd_hit = bdata.snd_hit;
        this._snd_destroy = bdata.snd_destroy;

        // add bullets to list
        if (Bullet._p_bullets[bdata.group])
            Bullet._p_bullets[bdata.group].push(this);
        else
            Bullet._p_bullets[bdata.group] = [this];

        // setup particles
        if (this._ps) {

            // set particle system's parent
            this._ps.parent = this;

            // always position particles at center of bullet
            this._ps.add_init_feature(function(p) {
                p.pos = p.sys.parent.position;
            });
        }

        // attach sound effects to events
        if (this._snd_create)
            this._events.create.push(p => p._snd_create.play());
        if (this._snd_hit)
            this._events.hit.push((p, t) => p._snd_hit.play());
        if (this._snd_destroy)
            this._events.destroy.push(p => p._snd_destroy.play());

        // begin life timer
        this._life_timer.start();

        // set state
        this._state = Bullet.INITIALIZED;
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // skip if destroyed
        if (this._state == Bullet.DESTROYED)
            return;

        // update life timer
        this._life_timer.update();

        // destroy the bullet if timer is up
        if (this._life_timer.stopped)
            this.destroy();

        // destroy the bullet if health is <= 0
        if (this._hp <= 0)
            this.destroy();

        // update particles
        if (this._ps)
            this._ps.update();

        // update projectile
        super.update();
    }

    /**
     * Static function: removes all targets, projectiles, and their
     * quadtree for a certian group. Does not trigger delete event by
     * default. Does not internally destroy projectiles by default.
     * * note: will delete non-Bullet projectiles in the given group
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // delete from projectile list
        Projectile.delete_group(group, trigger);

        // delete bullet list
        delete Bullet._p_bullets[group];
    }

    /**
     * Static function: removes all destroyed projectiles. Does
     * not remove empty groups. Does not trigger delete event by
     * default.
     * * note: also applies parent class deletions
     * 
     * @param {Boolean} [trigger=false] trigger delete events
     */
    static delete_destroyed(trigger=false) {

        // parent class deletions
        Projectile.delete_destroyed(trigger);

        // delete from this class
        var ps = Bullet._p_bullets;
        for (var g in ps)
            ps[g] = ps[g].filter(p => p._state != Projectile.DESTROYED);
    }
    
    /**
     * Static property: Number of bullets.
     * (includes destroyed, excludes deleted)
     * 
     * @type {Number} bullet count
     */
    static get count() {
        var c = 0;
        for (var g in this._p_bullets)
            c += this._p_bullets[g].length;
        return c;
    }
    
    /**
     * The ParticleSystem which emits from behind and underneath
     * the bullet.
     * 
     * @param {ParticleSystem} ps
     */
    get particle_sys() { return this._ps; }
    set particle_sys(ps) { this._ps = ps; }

    /**
     * Remaining time this bullet has until it will be automatically
     * destroyed.
     * 
     * @type {Number} time in milliseconds
     */
    get remaining() { return this._life_timer.remaining(); }

    /**
     * Elapsed time since this bullet was created.
     * 
     * @type {Number} time in milliseconds
     */
    get passed() { return this._life_timer.passed; }

    /**
     * Paused state of bullet's life-timer.
     * 
     * @type {Boolean}
     */
    get paused() { return this._life_timer.paused; }
    set paused(bool) { bool ? this._life_timer.pause() : this._life_timer.unpause(); }

    /**
     * Base health of the bullet.
     * 
     * @type {Number}
     */
    get health() { return this._hp; }
    set health(hp) { this._hp = hp; }

    /// (Private) 
    static _p_bullets = {};

    /// (Private) Particle system to be emitted from behind the bullet
    _ps;

    /// (Private) Timer tracking lifetime of bullet
    _life_timer;

    /// (Private) Base health of bullet
    _hp;

    /// (Private) Sound effect on bullet creation
    _snd_create;

    /// (Private) Sound effect on bullet, target collision
    _snd_hit;

    /// (Private) Sound effect on bullet destruction
    _snd_destroy;
    
}//end class