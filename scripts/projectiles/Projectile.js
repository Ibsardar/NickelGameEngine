////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Projectile
//  Filename:       Projectile.js
//  Date:           5/31/2019
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
//  Copyright (c) 2019 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

import { CollisionEventHandler } from "../CollisionEventHandler.js";

export { Projectile };

/**
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
     * - > .targets : (optional) list of collidable targets [default if group exsits = []]
     * - > .group : group id of targets and projectiles
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

        // set list of collidables for a certain group
        // * note: if a group already exists, it will be replaced *
        // * note: if targets is not specified, and group does not exist, then set empty target list
        // * note: if targets is not specified, and group already exists, then no targets will be set
        Projectile._targets[pdata.group] = pdata.targets;
        if (!pdata.targets && !Projectile._targets[pdata.group]) Projectile._targets[pdata.group] = [];
        this.group = pdata.group;

        // add projectile
        if (Projectile._projectiles[pdata.group])
            Projectile._projectiles[pdata.group].push(this);
        else
            Projectile._projectiles[pdata.group] = [this];

        // initialize quadtree if needed
        if (!Projectile._quadtrees[pdata.group]) {

            Projectile._qt_bounds.w = Projectile._scene.get_w();
            Projectile._qt_bounds.h = Projectile._scene.get_h();
            Projectile._quadtrees[pdata.group] = new QuadTree(
                Projectile._qt_max_objs,
                Projectile._qt_max_depth,
                Projectile._qt_bounds
            );
        }

        // add event responses (default: no response)
        if (pdata.on_create) this.on('create', pdata.on_create);
        if (pdata.on_hit) this.on('hit', pdata.on_hit);
        if (pdata.on_destroyed) this.on('destroy', pdata.on_destroyed);
        if (pdata.on_delete) this.on('delete', pdata.on_delete);

        // trigger create event
        this._state = Projectile.INITIALIZED;
    }

    /**
     * Static function: sets bounds of destruction on a specific
     * Projectile object.
     * 
     * @param  {Projectile} projectile
     * @param  {Object} bounds
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
     * Static function: sets targets (reference) for a certain group.
     * 
     * @param {object[]} targets array reference of target sprites/points/shapes/hulls
     * @param {String} group group id of targets
     */
    static set_targets(targets, group) {

        Projectile._targets[group] = targets;
    }
    
    /**
     * Static function: removes all targets, projectiles, and their
     * quadtree for a certian group. Does not trigger delete event by
     * default. Does not internally destroy projectiles by default.
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // trigger delete event for each removed projectile
        if (trigger) {
            var gp = Projectile._projectiles[group];
            for (var i in gp) {
                gp[i].destroy();
                gp[i].trigger('delete', gp[i]);
            }
        }

        delete Projectile._targets[group];
        delete Projectile._projectiles[group];
        delete Projectile._quadtrees[group];
    }

    /**
     * Static function: removes all destroyed projectiles. Also
     * removes empty groups. Does not trigger delete event by
     * default. DOES remove false indices in lists.
     * 
     * @param {Boolean} [trigger=false] trigger delete events
     */
    static delete_destroyed(trigger=false) {

        var ps = Projectile._projectiles;

        // remove empty groups
        for (var i in ps) 
            if (!ps[i] || !ps[i].length)
                delete ps[i];

        // for each destroyed projectile in all groups:
        // - trigger delete if trigger=true
        // - remove from list
        for (var g in ps) {
            if (trigger) {
                ps[g] = ps[g].filter(function(p){
                    if (!p) return false;
                    if (p._state == Projectile.DESTROYED) {
                        p.trigger('delete', p);
                        return false;
                    } else
                        return true;
                });
            } else {
                ps[g] = ps[g].filter(p =>
                    p && p._state != Projectile.DESTROYED
                );
            }
        }
    }

    /**
     * Static function: Triggers events based on current state of projectiles.
     * Must be called at regular intervals (ex: 60 times per second i.e. 60fps).
     */
    static handle_triggers() {

        // handle Projectile-specific triggers
        Projectile._handle_create_triggers();
        Projectile._handle_hit_triggers();
        Projectile._handle_destroy_triggers();
        Projectile._handle_delete_triggers();
    }

    /**
     * Private Static function: Triggers 'create' when projectiles are created.
     */
    static _handle_create_triggers() {

        // check for created projectiles (and change state)
        var ps = Projectile._projectiles;
        for (var g in ps) {
            for (var i in ps[g]) {
                if (ps[g][i]._state == Projectile.INITIALIZED) {
                    ps[g][i]._state = Projectile.CREATED;
                    ps[g][i].trigger('create', ps[g][i]);
                }
            }
        }
    }

    /**
     * Private Static function: Triggers 'hit' when projectiles hit a target.
     */
    static _handle_hit_triggers() {
        
        // begin collision checking by preparing qaudtrees:
        // clear & fill all quadtrees with projectiles of same group
        // * note: ignore all destroyed projectiles *
        var ps = Projectile._projectiles;
        var qs = Projectile._quadtrees;
        for (var g in qs) {
            qs[g].clear();
            for (var i in ps[g]) {
                var p = ps[g][i];
                if (p._state != Projectile.DESTROYED && p.collidable) {
                    qs[g].in(p,
                        [p.sprite.get_left(), p.sprite.get_top()],
                        [p.sprite.get_w_bound(), p.sprite.get_h_bound()]
                    );
                }
            }
        }

        // check if projectiles are hitting targets from same group
        // * note: ignore all destroyed targets *
        CollisionEventHandler.handle(Projectile, Projectile._targets, qs, ['sprite'], []);

        /***
        // check if projectiles are hitting targets from same group
        // * note: ignore all destroyed targets *
        var ts = Projectile._targets;
        for (var g in ts) {
            for (var i in ts[g]) {

                // determine bounds
                // bounds (left, top, width, height)
                var b = [0, 0, 0, 0];

                // target
                var t = ts[g][i];

                // if target is point
                if (Nickel.UTILITY.is_array(t))
                    b = [t[0], t[1], 1, 1];
                // if target is polygon
                else if (t.type == 'SimplePoly') {
                    var bounds = t.get_bounds(true);
                    b = [bounds.x,
                         bounds.y,
                         bounds.w,
                         bounds.h];
                // if target is circle
                } else if (t.type == 'SimpleCircle')
                    b = [t.cx - t.radius,
                         t.cy - t.radius,
                         t.radius + t.radius,
                         t.radius + t.radius];
                // if target is sprite
                else {
                    // skip if target is destroyed
                    if (t.is_destroyed()) continue;
                    // else get bounds
                    b = [t.get_left(),
                         t.get_top(),
                         t.get_w_bound(),
                         t.get_h_bound()];
                }

                // get nearby projectiles
                var qt_list = qs[g].get([b[0], b[1]], [b[2], b[3]]);
                for (var j in qt_list) {
                    if (qt_list[j].entity.sprite.colliding_with(t, false))
                        qt_list[j].entity.trigger('hit', qt_list[j].entity, t);
                }
            }
        }***/
    }

    /**
     * Private Static function: Triggers 'destroy' when projectiles are destroyed.
     */
    static _handle_destroy_triggers() {

        // check for destroyed projectiles (and change state)
        var ps = Projectile._projectiles;
        for (var g in ps) {
            for (var i in ps[g]) {
                if (ps[g][i].sprite.is_destroyed() && ps[g][i]._state != Projectile.DESTROYED) {
                    ps[g][i]._state = Projectile.DESTROYED;
                    ps[g][i].trigger('destroy', ps[g][i]);
                }
            }
        }
    }

    /**
     * Private Static function: Triggers 'delete' when projectiles are deleted.
     * Default cannot detect deletion (removal from some outside data structure),
     * therefore must be overrided from outside to properly handle deletion.
     */
    static _handle_delete_triggers() {

        //...override
    }

    /**
     * Static function: Transfers a projectile from its existing group to a new group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {Projectile} p projectile object that wants to change group
     * @param  {String} g group to change to
     */
    static change_group(p, g) {
        
        Projectile.remove_from_group(p);
        if (!Projectile._projectiles[g])
            Projectile._projectiles[g] = [];
        Projectile._projectiles[g].push(p);
    }

    /**
     * Static function: Removes a projectile from its existing group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {Projectile} p projectile object that wants to change group
     */
    static remove_from_group(p) {
        
        var oldg = p.group;
        p.group = null;
        for (var i in Projectile._projectiles[oldg]) {
            var oldp = Projectile._projectiles[oldg][i];
            if (oldp.sprite.id == p.sprite.id) {
                Projectile._projectiles[oldg][i] = null;
                break;
            }
        }
    }

    /**
     * Static function: Get entire list of projectiles from a certain group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {String} g group name
     * @return {Projectile[]} list of projectiles
     */
    static get_group(g) {
        return Projectile._projectiles[g];
    }
    
    /**
     * Static property: Number of projectiles.
     * (includes destroyed, excludes deleted)
     * 
     * @type {Number} projectile count
     */
    static get count() {

        var c = 0;
        for (var g in Projectile._projectiles)
            c += Projectile._projectiles[g].length;
            
        return c;
    }
    
    /**
     * Static property: Number of groups.
     * (excludes deleted)
     * 
     * @type {Number} group count
     */
    static get group_count() {

        return Object.keys(Projectile._projectiles).length;
    }

    /**
     * Static: Calls 'update' on all projectiles.
     * (excludes deleted, optionally includes destroyed)
     */
    static update_all(update_destroyed=false) {

        for (var h in Projectile._projectiles) {
            var g = Projectile._projectiles[h];
            for (var i in g) {
                var p = g[i];
                if (p) {
                    if (p._state != Projectile.DESTROYED || update_destroyed)
                        p.update();
                }
            }
        }
    }

    /**
     * Static: Calls 'update' on all projectiles EXCEPT
     * groups specified in the groups list parameter..
     * (excludes deleted, optionally includes destroyed)
     */
    static update_except(groups=[], update_destroyed=false) {

        for (var h in Projectile._projectiles) {
            if (groups.find(h)) continue;
            var g = Projectile._projectiles[h];
            for (var i in g) {
                var p = g[i];
                if (p) {
                    if (p._state != Projectile.DESTROYED || update_destroyed)
                        p.update();
                }
            }
        }
    }

    /**
     * Static: Calls 'update' on all projectiles EXCEPT
     * groups NOT specified in the groups list parameter..
     * (excludes deleted, optionally includes destroyed)
     */
    static update_only(groups=[], update_destroyed=false) {

        for (let h of groups) {
            var g = Projectile._projectiles[h];
            if (!g) continue;
            for (var i in g) {
                var p = g[i];
                if (p) {
                    if (p._state != Projectile.DESTROYED || update_destroyed)
                        p.update();
                }
            }
        }
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

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
        Projectile._targets = {};
        Projectile._projectiles = {};
        Projectile._quadtrees = {};
        Projectile._qt_bounds = {
            x : 0,
            y : 0,
            w : 0,
            h : 0
        };
        Projectile._qt_max_objs = 3;
        Projectile._qt_max_depth = 4;
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

    /// (Private Static) Table object of grouped collidables.
    /// Only works with Sprites, Array points, SimplePolys or SimpleCircles.
    /// Format:
    ///     { 'group1' : [list of sprites/hulls/shapes/points] (reference)
    ///       'group2' : [another list of sprites/hulls/shapes/points] (reference)
    ///       ...etc
    ///     }
    static _targets = {};

    /// (Private Static) Table object of grouped projectiles.
    /// Format:
    ///     { 'group1' : [list of projectiles]
    ///       'group2' : [another list of projectiles]
    ///       ...etc
    ///     }
    static _projectiles = {};

    /// (Private Static) Table of quadtrees of grouped projectiles.
    /// Format:
    ///     { 'group1' : Quadtree of projectiles (reference)
    ///       'group2' : another Quadtree of projectiles (reference)
    ///       ...etc
    ///     }
    static _quadtrees = {};

    /// (Private Static) Quadtree bounds.
    static _qt_bounds = {
        x : 0,
        y : 0,
        w : 0,
        h : 0
    };

    /// (Private Static) Quadtree max objects per cell.
    static _qt_max_objs = 3;

    /// (Private Static) Quadtree max tree depth.
    static _qt_max_depth = 4;

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

    /// Group this projectile belongs to.
    group;

    /// Combat variables
    _dmg_normal; // damage to armor, then health
    _dmg_pierce; // damage to health only
    _dmg_break; // damage to armor only
    _effects = []; // effects applied on hit

}//end class