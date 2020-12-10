////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Projectile
//  Filename:       Projectile.js
//  Date:           10/3/2020
//  Description:    Abstract class that describes an arbitrary projectile.
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

import { CollisionEventHandler } from "../CollisionEventHandler.js";

export { Projectile };

/**
 * *** @EXPERIMENTAL ***
 * @class Projectile
 * 
 * Meant to be used as an abstract class for
 * creating different types of Projectiles.
 */
class Projectile {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param  {object} pdata data object of projectile parameters.
     * - > .sprite_data : data for Sprite creation
     * - > .bounds : (optional) data for projectile bounds relative to canvas
     *   > - .left : left bound
     *   > - .right : right bound
     *   > - .top : top bound
     *   > - .bottom : bottom bound
     * - > .script_effect : (optional) post update function; called every frame
     * - > .on_create : (optional) create event trigger function
     * - > .on_hit : (optional) collision event trigger function
     * - > .on_destroyed : (optional) destroy event trigger function
     * - > .on_delete : (optional) delete event trigger function
     */
    constructor(scene, pdata) {

        // set waiting initialization state
        this._state = Projectile.WAITING_INIT;

        // set scene if needed
        if (!Projectile._scene) Projectile._scene = scene;

        // set sprite + circle collision hull + make sprite's center the origin
        this.sprite = new Sprite(scene, pdata.sprite_data, true, false);
        var hull = new ColliderHull(this.sprite, false);
        var max_side = Math.max(this.sprite.get_w(), this.sprite.get_h());
        var shape = new SimpleCircle(scene, max_side * 0.5); // 50% of max side
        this.sprite.set_origin_centered();
        shape.set_center(this.sprite.get_center());
        hull.set_shape(shape);
        this.sprite.set_hull(hull);

        // set bounds (defult: destroy on leave screen + 50px)
        if (pdata.bounds) Projectile.set_bounds(this, pdata.bounds);

        // set script effect (default: none)
        if (pdata.script_effect) this.update_more = pdata.script_effect;

        // add event responses (default: no response)
        if (pdata.on_create) this.on('create', pdata.on_create);
        if (pdata.on_hit) this.on('hit', pdata.on_hit);
        if (pdata.on_destroyed) this.on('destroy', pdata.on_destroyed);
        if (pdata.on_delete) this.on('delete', pdata.on_delete);

        // increment created count
        Projectile._count++

        // trigger create event
        this._state = Projectile.CREATED;
        this.trigger('create', this);
    }

    /**
     * Static function: sets bounds of destruction on a specific
     * Projectile object.
     * 
     * @param  {Projectile} projectile
     * @param  {left:0, right:0, top:0, bottom:0} bounds
     */
    static set_bounds(projectile, bounds) {

        projectile.sprite.bound = function() {
            var r = this.get_right();
            var t = this.get_top();
            var l = this.get_left();
            var b = this.get_bottom();

            if (r < bounds.left ||
                t > bounds.bottom ||
                l > bounds.right ||
                b < bounds.top) {

                this.destroy();
            }
        }
    }

    /**
    * Number of projectiles in all groups.
    * (excludes destroyed)
    * 
    * @type {Number} projectile count
    */
    static get count() { return Projectile._count; }

    /**
    * Number of destroyed projectiles in all groups.
    * 
    * @type {Number} projectile count
    */
    static get dead_count() { return Projectile._dead_count; }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // check destroy trigger
        if (this.sprite.is_destroyed() && this._state != Projectile.DESTROYED) {
            Projectile._count--;
            Projectile._dead_count++;
            this._state = Projectile.DESTROYED;
            this.trigger('destroy', this);
            return;
        }

        // update sprite
        this.sprite.update();

        // update additional script
        this.update_more(this);
    }

    /**
     * Custom update called once per frame after main update.
     *
     * @param {Projectile} projectile host projectile of this function
     */
    update_more(projectile) {

        //...override
    }

    /**
     * @todo implement carefully
     */
    copy() {

        //...
    }

    /**
     * Destroys the internal sprite.
     */
    destroy() {

        // destroy sprite
        this.sprite.destroy();
    }

    /**
     * @todo document properly in extensions of Projectile
     * Triggers an event with the given arguments:
     * - 'create'   has 1 argument:     projectile
     * - 'hit'      has 2 arguments:    projectile, target
     * - 'destroy'  has 1 argument:     projectile
     * - 'delete'   has 1 argument:     projectile
     * 
     * @param  {String} ev name of event to be triggered
     * @param  {...object} args arguments to be passed into the response function
     */
    trigger(ev, ...args) {

        // trigger all continuous responses for this event
        for (var i in this._events[ev])
            this._events[ev][i](...args);

        // trigger and remove all one-time responses for this event
        while (!this._once_events[ev].is_empty())
            this._once_events[ev].out()(...args);
    }
    
    /**
     * Responds with the given function every time the specified event is
     * triggered.
     * 
     * @param  {String} ev name of event to respond to
     * @param  {Function} func response function
     */
    on(ev, func) {

        // add given function to be triggered on selected event
        this._events[ev].push(func);

        // return index of this function
        return this._events[ev].length - 1;
    }
    
    /**
     * Responds one time with the given function after the specified event
     * is triggered.
     * 
     * @param  {String} ev name of event to respond to
     * @param  {Function} func one-time response function
     */
    once(ev, func) {

        // add given function to be triggered once on selected event
        this._once_events[ev].in(func);
    }

    /**
     * Removes a response that is continuously responding to the specified
     * event by using the given index.
     * 
     * @param  {String} ev name of event to remove from
     * @param  {Number} index index of response in event bus (returned by 'on')
     */
    remove_response(ev, index) {

        // remove specified response function from continous events
        this._events[ev].splice(index, 1);
    }

    /**
     * Resets all static data to the default values.
     */
    static reset() {
        
        Projectile._scene = null;
        Projectile._count = 0;
        Projectile._dead_count = 0;
    }

    /**
     * Coordinates of the bullet's center.
     * 
     * @type {Number[]} cx,cy coordinates
     */
    get position() { return this.sprite.get_center(); }
    set position(c) { this.sprite.set_center(c[0], c[1]); }

    /**
     * Base speed of the bullet.
     * 
     * @type {Number}
     */
    get speed() { return this.sprite.get_speed(); }
    set speed(spd) { this.sprite.set_speed(spd); }

    /**
     * Base acceleration of the bullet.
     * 
     * @type {Number}
     */
    get acceleration() { return this.sprite.get_accel(); }
    set acceleration(acc) { this.sprite.set_accel(acc); }

    /**
     * Direction of the bullet.
     * 
     * @type {Number} degrees
     */
    get direction() { return this.sprite.get_dir(); }
    set direction(dir) { this.sprite.set_turn(dir); }

    /**
     * Maximum turning arc of the bullet.
     * 
     * @type {Number} degrees
     */
    get max_rotation() { return this.sprite.get_rot_max(); }
    set max_rotation(arc) { this.sprite.set_rot_max(arc); }

    /**
     * Base scale of the bullet.
     * 
     * @type {Number[]} sx,sy scale
     */
    get scale() { return this.sprite.get_scale(); }
    set scale(s) { this.sprite.set_scale2(s[0], s[1]); }
    
    /**
     * Is the projectile collidable or not.
     * 
     * @type {Boolean} collidable or not
     */
    get collidable () { return this._collidable; }
    set collidable (bool) {
        this._collidable = bool;
        if (this._collidable && !this.sprite.hull) {
            console.error('ERROR: Projectile>set collidable: sprite does not have a hull so projectile cannot be collidable.');
            this._collidable = false;
        }
    }

    /// (Static Constant) Projectile states.
    static get WAITING_INIT ()  { return 0; }
    static get INITIALIZED  ()  { return 1; }
    static get CREATED      ()  { return 2; }
    static get DESTROYED    ()  { return 3; }

    /// (Private Static) Viewport of all projectiles.
    static _scene;

    /// (Static Private) Projectile count tracking
    static _count = 0;
    static _dead_count = 0;

    /// (Private) State of projectile. Based partially on events
    /// that have been handelled.
    _state = 0;

    /// (Private) Event, effect-function lists of projectile.
    _events = {
        create : [],
        hit : [],
        destroy : [],
        delete : []
    }

    /// (Private) One-time event, effect-function lists of projectile.
    _once_events = {
        create : new Queue(),
        hit : new Queue(),
        destroy : new Queue(),
        delete : new Queue()
    }

    /// (Private) indicates if this projectile is collidable
    _collidable = true;

    /// Main sprite object of bullet.
    sprite;

    /// Combat variables
    _dmg_normal; // damage to armor, then health
    _dmg_pierce; // damage to health only
    _dmg_break; // damage to armor only
    _effects = []; // effects applied on hit

}//end class