////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Sticky, Bullet, Projectile
//  Filename:       StickyBullet.js
//  Date:           6/6/2019
//  Description:    Class that describes a sticky bullet projectile.
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

import { Bullet } from "./Bullet.js";

export { StickyBullet };

/**
 * @class StickyBullet
 * 
 * Describes a sticky bullet of various properties.
 * Sticks to a target for an amount of time.
 */
class StickyBullet extends Bullet {

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
     * 
     * StickyBullet specific params:
     * - > .is_sticky : enables/disables stickiness (default true)
     * - > .sticktime : amount of time (ms) to be sticking
     * - > .interval : amount of time (ms) between interval effects while sticking (> 0)
     * - > .snd_stick : (optional) sound effect on stick
     * - > .snd_interval : (optional) sound effect on interval
     * - > .on_stick : (optional) stick event trigger function
     * - > .on_interval : (optional) interval event trigger function
     */
    constructor(scene, bdata) {
        super(scene, bdata);

        // reset state (init not done yet)
        this._state = StickyBullet.WAITING_INIT;

        // set mandatory vars
        this._stick_timer = new SimpleTimer();
        this._stick_timer.set_alarm(bdata.sticktime);

        // set optional vars
        this._interval = bdata.interval; // must be greater than 0
        this._snd_stick = bdata.snd_stick;
        this._snd_interval = bdata.snd_interval;
        
        // enable stickiness by default
        if (bdata.is_sticky == null || bdata.is_sticky == undefined)
            this.is_sticky = true;
        else
            this.is_sticky = bdata.is_sticky;

        // create new events
        this._events.stick = [];
        this._events.interval = [];
        this._once_events.stick = new Queue();
        this._once_events.interval = new Queue();

        // only add events if stickiness enabled
        if (this.is_sticky) {

            // add sound effect responses to events (default: no response)
            if (this._snd_stick)
                this._events.stick.push((p, t) => p._snd_stick.play());
            if (this._snd_interval)
                this._events.interval.push((p, t) => p._snd_interval.play());

            // add event responses (default: no response)
            if (bdata.on_stick) this.on('stick', bdata.on_stick);
            if (bdata.on_interval) this.on('interval', bdata.on_interval);

            // handle initial sticky trigger
            this.once('hit', function(p, t) {
                if (p._state != StickyBullet.DESTROYED) {
                    p._state = StickyBullet.STICKIED;
                    p._host = t;
                    p._dp = [t.get_cx() - p.sprite.get_cx(),
                            t.get_cy() - p.sprite.get_cy()];
                    p._dr = t.get_dir() - p.sprite.get_dir();
                    p._ds = [t.get_scalex() - p.sprite.get_scalex(),
                            t.get_scaley() - p.sprite.get_scaley()];
                    p._stick_timer.start(); // begin stick timer
                    p.trigger('stick', p, t);
                }
            });
        }

        // add sticky bullet to specialized list of projectiles
        // * note: if group does not exist, it will be created *
        if (StickyBullet._p_stickies[this.group])
            StickyBullet._p_stickies[this.group].push(this);
        else
            StickyBullet._p_stickies[this.group] = [this];

        // set state
        this._state = StickyBullet.INITIALIZED;
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // skip if destroyed
        if (this._state == StickyBullet.DESTROYED)
            return;

        // if stickiness enabled
        if (this.is_sticky) {

            // update stick timer
            this._stick_timer.update();

            // destroy the bullet if stick timer is up
            if (this._stick_timer.stopped)
                this.destroy();

            // stick if stick timer has started
            if (this._stick_timer.started)
                this.stick();
        }

        // update bullet
        super.update();
    }

    /**
     * Static function: removes all targets, projectiles, and their
     * quadtree for a certian group. Does not trigger delete event by
     * default. Does not internally destroy projectiles by default.
     * * note: will delete non-StickyBullet projectiles in the given group
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // delete from projectile list
        Bullet.delete_group(group, trigger);

        // delete sticky bullet list
        delete StickyBullet._p_stickies[group];
    }

    /**
     * Static function: removes all destroyed projectiles. Also
     * removes empty groups. Does not trigger delete event by
     * default.
     * * note: also applies parent class deletions //@todo replace this comment with the proper warning
     * 
     * @param {Boolean} [trigger=false] trigger delete events //@todo remove this parameter
     */
    static delete_destroyed(trigger=false) {

        // parent class deletions
        //Bullet.delete_destroyed(trigger);

        // delete from this class
        var ps = StickyBullet._p_stickies;

        // remove empty groups
        for (var i in ps) 
            if (!ps[i] || !ps[i].length)
                delete ps[i];
        
        // remove dead objects
        for (var g in ps)
            ps[g] = ps[g].filter(p => p && p._state != StickyBullet.DESTROYED);
    }
    
    /**
     * Static property: Number of sticky bullets.
     * (includes destroyed, excludes deleted)
     * 
     * @type {Number} sticky bullet count
     */
    static get count() {
        var c = 0;
        for (var g in StickyBullet._p_stickies)
            c += StickyBullet._p_stickies[g].length;
        return c;
    }

    /**
     * Static function: Triggers events based on current state of sticky bullets.
     * Must be called at regular intervals (ex: 60 times per second i.e. 60fps).
     */
    static handle_triggers() {

        // handle StickyBullet-specific triggers
        StickyBullet._handle_interval_trigger();
    }

    /**
     * Private Static function: Triggers 'interval' every interval
     * while bullet is stickied.
     */
    static _handle_interval_trigger() {

        // check each particle (and change state)
        var ps = StickyBullet._p_stickies;
        for (var g in ps) {
            for (var i in ps[g]) {

                // skip if projectile is not a sticky bullet
                if (!(ps[g][i] instanceof StickyBullet))
                    continue;

                // skip if stickiness is disabled
                if (!ps[g][i].is_sticky)
                    continue;

                // trigger interal event if interval passed
                if (ps[g][i]._state == StickyBullet.STICKIED &&
                    ps[g][i]._state != StickyBullet.DESTROYED) {
                    var next_interval = ps[g][i]._last_interval + ps[g][i]._interval;
                    if (ps[g][i]._stick_timer.passed >= next_interval) {
                        ps[g][i]._last_interval = next_interval;
                        ps[g][i].trigger('interval', ps[g][i], ps[g][i]._host);
                    }
                }
            }
        }
    }

    /**
     * Updates stick position to host sprite.
     * @todo fix accuracy
     */
    stick() {

        // temporary simple method
        //this.position = this._host.get_center();

        // stop the bullet from moving
        this.speed = 0;
        this.acceleration = 0;

        // translate pos difference
        this.position = Nickel.v2d.sub(this._host.get_center(), this._dp);

        // rotate around host origin by rot difference
        /** @todo note: not so accurate...turn matching needs fixing 6/10/2019 **/
        var nxtr = this._host.get_dir() - this._dr;
        var dr = nxtr - this.direction;
        this.sprite.rotate_around(dr, this._host.get_center());
        this.direction = nxtr;

        // scale only the position from host origin by scale difference
        //...TODO
    }

    /**
     * @overrides parent class function.
     * Resets all static data to the default values.
     * If deep is false, then do not reset parent class.
     */
    static reset(deep=true) {

        if (deep) Bullet.reset();
        StickyBullet._p_stickies = {};
    }

    /**
     * Override: Paused state of bullet's life-timer and stick-timer.
     *
     * @type {Boolean}
     */
    get paused() { return super.paused; }
    set paused(bool) {
        super.paused = bool;
        bool ? this._stick_timer.pause() : this._stick_timer.unpause();
    }

    /// (Static Constant) Additional StickyBullet state.
    static get STICKIED() { return 4; }

    /// (Private Static) List of StickyBullet Projectiles
    /// Format:
    ///     { 'group1' : [list of sticky projectiles]
    ///       'group2' : [another list of sticky projectiles]
    ///       ...etc
    ///     }
    static _p_stickies = {};

    /// (Private) Timer tracking sticktime of bullet.
    _stick_timer;

    /// (Private) Interval time (ms) for interval effect to trigger while stuck.
    _interval;

    /// (Private) Last recorded interval time (ms).
    _last_interval = 0;

    /// (Private) Sound effect on bullet stick.
    _snd_stick;

    /// (Private) Sound effect on bullet interval while stuck.
    _snd_interval;

    /// (Private) Host target the bullet is currently stickied to.
    _host;

    /// (Private) Difference of center-positions from bullet to host.
    _dp;

    /// (Private) Difference of rotation angle (degs) from bullet to host.
    _dr;

    /// (Private) Difference of scale from bullet to host.
    _ds;

}//end StickyBullet