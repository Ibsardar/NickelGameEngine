////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Actor
//  Filename:       Actor.js
//  Date:           4/15/2020
//  Description:    Abstract class that describes a sprite/locomotive with
//                  better acting abilities.
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

import { Limb } from "./Limb.js";
import { CollisionEventHandler } from "./CollisionEventHandler.js";
import { Equipable } from "./limbs/Equipable.js";

export { Actor };

/**
 * @class Actor
 * 
 * Meant to be used as an abstract class for
 * creating different types of Actorss.
 */
class Actor {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param  {object} adata data object of actor parameters.
     * - > .skeleton : Skeleton object for animation purposes
     * - > .pre_script_effect : (optional) pre update function; called every frame
     * - > .post_script_effect : (optional) post update function; called every frame
     * - > .targets : (optional) list of collidable targets [default if group exsits = []]
     * - > .group : group id of targets and actors
     * - > .on_create : (optional) create event trigger function
     * - > .on_hit : (optional) collision event trigger function
     * - > .on_destroyed : (optional) destroy event trigger function
     * - > .on_delete : (optional) delete event trigger function
     * - > .on_action_complete : (optional) action-complete event trigger function
     */
    constructor(scene, adata) {

        // set waiting initialization state
        this._state = Actor.WAITING_INIT;

        // set scene if needed
        if (!Actor._scene) Actor._scene = scene;

        // set skeleton
        this.skeleton = adata.skeleton;

        // set actor on each limb of skeleton
        var self = this;
        this.skeleton.each((limb) => limb.actor = self);

        // set script effects (default: nothing)
        if (adata.pre_script_effect) this.update_before = adata.pre_script_effect;
        if (adata.post_script_effect) this.update_more = adata.post_script_effect;

        // set list of collidables for a certain group
        // * note: if a group already exists, it will be replaced *
        // * note: if targets is not specified, and group does not exist, then set empty target list
        // * note: if targets is not specified, and group already exists, then no targets will be set
        if (adata.targets) Actor._targets[adata.group] = adata.targets;
        if (!adata.targets && !Actor._targets[adata.group]) Actor._targets[adata.group] = [];
        this.group = adata.group;

        // add actor
        if (Actor._actors[adata.group])
            Actor._actors[adata.group].push(this);
        else
            Actor._actors[adata.group] = [this];

        // init group's QT
        if (!Actor._quadtrees[adata.group]) {
            
            Actor._qt_bounds.w = Actor._scene.get_w();
            Actor._qt_bounds.h = Actor._scene.get_h();
            Actor._quadtrees[adata.group] = new QuadTree(
                Actor._qt_max_objs,
                Actor._qt_max_depth,                 
                Actor._qt_bounds
            );
        }

        // add event responses (default: no response)
        if (adata.on_create) this.on('create', adata.on_create);
        if (adata.on_hit) this.on('hit', adata.on_hit);
        if (adata.on_destroyed) this.on('destroy', adata.on_destroyed);
        if (adata.on_delete) this.on('delete', adata.on_delete);
        if (adata.on_action_complete) this.on('action-complete', adata.on_action_complete);

        // trigger create event
        this._state = Actor.INITIALIZED;
        Actor._create_trigger_queue.in(() => {
            self._state = Actor.CREATED;
            self.trigger('create', self);
        });
    }

    /**
     * @interface
     * 
     * Returns body part img data in the format:
     * 'body' : img_data
     * ...
     */
    get_data() {}
    
    /**
     * Static function: sets targets (reference) for a certain group.
     * 
     * @param {object[]} targets array reference of target sprites/points/shapes/hulls
     * @param {String} group group id of targets
     */
    static set_targets(targets, group) {

        Actor._targets[group] = targets;
    }
    
    /**
     * Static function: removes all targets, limbs, and their
     * quadtree for a certian group. Does not trigger delete event by
     * default. Does not internally destroy limbs by default.
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // trigger delete event for each removed actor
        if (trigger) {
            var gp = Actor._actors[group];
            for (let actor of gp) {
                actor.destroy();
                actor.trigger('delete', actor);
            }
        }

        delete Actor._targets[group];
        delete Actor._actors[group];
        delete Actor._quadtrees[group];
    }

    /**
     * Static function: removes all destroyed actors. Also
     * removes empty groups. Does not trigger delete event by
     * default.
     * 
     * @param {Boolean} [trigger=false] trigger delete events
     */
    static delete_destroyed(trigger=false) {

        ls = Actor._actors;

        // remove empty groups
        for (var i in ls) 
            if (!ls[i] || !ls[i].length)
                delete ls[i];

        // remove dead actors
        for (var g in ls) {

            // filter out dead actors and trigger event
            if (trigger) {
                ls[g] = ls[g].filter(actor => {
                    if (!actor) return false;
                    if (actor._state == Actor.DESTROYED) {
                        actor.trigger('delete', actor);
                        return false;
                    } else
                        return true;
                });

            // filter out dead actors only
            } else {
                ls[g] = ls[g].filter(actor =>
                    actor && actor._state != Actor.DESTROYED
                );
            }
        }
    }

    /**
     * Static function: Triggers events based on current state of actors.
     * Must be called at regular intervals (ex: 60 times per second i.e. 60fps).
     */
    static handle_triggers() {

        // handle Actor-specific triggers
        Actor._handle_create_triggers();
        Actor._handle_hit_triggers(); 
        Actor._handle_destroy_triggers();
        Actor._handle_delete_triggers(); 
        Actor._handle_action_complete_triggers();
    }

    /**
     * Private Static function: Triggers 'create' when actors are created.
     */
    static _handle_create_triggers() {

        // run queued trigger functions
        while (!Actor._create_trigger_queue.is_empty())
            Actor._create_trigger_queue.out()();
    }

    /**
     * Private Static function: Triggers 'hit' when actors hit a target.
     */
    static _handle_hit_triggers() {

        // TODO: make this more efficient (maybe store the collected and only update when a change flag is true per actor?)
        // collect all collidable limbs by group
        var ls = {};
        for (var i in Actor._actors) {
            var g = Actor._actors[i];
            for (let a of g) {
                var a_gs = a.skeleton.get_grouped_limbs();
                for (var key in a_gs) {
                    if (ls[key])
                        ls[key] = [...ls[key], a_gs[key]];
                    else
                        ls[key] = a_gs[key];
                }
            }
        }
        
        // begin collision checking by preparing qaudtrees:
        // clear & fill all quadtrees with limbs of same group
        // * note: ignore all destroyed limbs *
        // * note: ignore all non-collidable limbs (specified by skeleton) *
        var qs = Actor._quadtrees;
        for (var g in qs) {
            qs[g].clear();
            for (var i in ls[g]) {
                var limb = ls[g][i];
                if (!limb.disabled && limb.collidable) {
                    if (limb.sprite && !limb.sprite.is_destroyed()) {
                        qs[g].in(limb,
                            [limb.sprite.get_left(), limb.sprite.get_top()],
                            [limb.sprite.get_w_bound(), limb.sprite.get_h_bound()]
                        );
                    }
                }
            }
        }

        // trigger those limbs that are hitting targets from same group
        // * note: ignore all destroyed targets *
        CollisionEventHandler.handle(Actor, Actor._targets, qs, ['sprite'], ['actor']);
    }

    /**
     * Private Static function: Triggers 'destroy' when actors are destroyed.
     */
    static _handle_destroy_triggers() {

        // run queued trigger functions
        while (!Actor._destroy_trigger_queue.is_empty())
            Actor._destroy_trigger_queue.out()();
    }

    /**
     * Private Static function: Triggers 'delete' when actors are deleted.
     * Default cannot detect deletion (removal from some outside data structure),
     * therefore must be overrided from outside to properly handle deletion.
     */
    static _handle_delete_triggers() {

        //...override
    }

    /**
     * Private Static function: Triggers 'action-complete' when actions
     * are performed to completion by actors.
     */
    static _handle_action_complete_triggers() {

        // run queued trigger functions
        while (!Actor._action_complete_trigger_queue.is_empty())
            Actor._action_complete_trigger_queue.out()();
    }

    /**
     * Static function: Transfers an actor from its existing group to a new group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {Actor} a actor object that wants to change group
     * @param  {String} g group to change to
     */
    static change_group(a, g) {
        
        Actor.remove_from_group(a);
        if (!Actor._actors[g])
            Actor._actors[g] = [];
        Actor._actors[g].push(a);
    }

    /**
     * Static function: Removes an actor from its existing group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {Actor} a actor object that wants to change group
     */
    static remove_from_group(a) {
        
        var oldg = a.group;
        a.group = null;
        for (var i in Actor._actors[oldg]) {
            var olda = Actor._actors[oldg][i];
            if (olda.sprite.id == a.sprite.id) {
                Actor._actors[oldg][i] = null;
                break;
            }
        }
    }

    /**
     * Static function: Get entire list of actors from a certain group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {String} g group name
     * @return {Actor[]} list of actors
     */
    static get_group(g) {
        return Actor._actors[g];
    }
    
    /**
     * Static property: Number of actors.
     * (includes destroyed, excludes deleted)
     * 
     * @type {Number} limb count
     */
    static get count() {
        var c = 0;
        for (var g in Actor._actors)
            c += Actor._actors[g].length;
        return c;
    }

    /**
     * Static: Calls 'update' on all actors.
     * (excludes deleted, excludes destroyed)
     */
    static update_all() {

        for (var h in Actor._actors) {
            var g = Actor._actors[h];
            for (var i in g) {
                var a = g[i];
                if (a) {
                    a.update();
                }
            }
        }
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // if destroyed, then ignore
        if (this._state == Actor.DESTROYED) return;

        // update additional script
        this.update_before(this);

        // update skeleton of limbs of sprites
        this.skeleton.update();

        // update additional script
        this.update_more(this);
    }

    /**
     * Custom update called once per frame before main update.
     *
     * @param {Actor} actor host actor of this function
     */
    update_before(actor) {

        //...override
    }

    /**
     * Custom update called once per frame after main update.
     *
     * @param {Actor} actor host actor of this function
     */
    update_more(actor) {

        //...override
    }

    /**
     * Returns a copy/clone of self.
     */
    copy(different_group=null) {

        // new Actor
        return new Actor(Actor._scene, {
            'skeleton' : this.skeleton.copy(),
            'group' : different_group ? different_group : this.group
        });
    }

    /// alias of copy
    clone = this.copy;

    /**
     * Destroys the internal sprites.
     */
    destroy() {

        // skip if already destroyed
        if (this._state == Actor.DESTROYED) return;

        // queue destroy event
        var self = this;
        Actor._destroy_trigger_queue.in(() => {
            self._state = Actor.DESTROYED;
            self.trigger('destroy', self);
        });
    }

    /**
     * @todo document properly in extensions of Actor
     * Triggers an event with the given arguments:
     * - 'create'           has 1 argument:     actor
     * - 'hit'              has 2 arguments:    limb, target
     * - 'destroy'          has 1 argument:     actor
     * - 'delete'           has 1 argument:     actor
     * - 'action-complete'  has 2 arguments:    actor, action
     * - 'equip'            has 2 arguments:    actor, equipable
     * - 'unequip'          has 2 arguments:    actor, equipable
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
     * Equips an equipable object to a leaf limb.
     * (If limb is equipable, unequip it first)
     * If remember, remember the current NON-EQUIPABLE limb.
     * If non-leaf limb, return false.
     * If an equipable was unequipped first, return it.
     * 
     * @param {Equipable} equipable 
     * @param {String} part_name 
     * @param {Boolean} remember remember the limb that was replaced?
     * @return was the equip successful? If so, return any unequipped equipable.
     */
    equip(equipable, part_name, remember=false) {

        var part = this.skeleton.part(part_name);

        if (part.has_children()) {

            console.error('ERROR: Actor>equip: cannot equip to a non-leaf limb.');
            return false;
        } else if (equipable.body_node) {

            console.error('ERROR: Actor>equip: equipable cannot have a parent.');
            return false;
        } else if (remember) {

            this.skeleton.set_part(part_name, equipable);
            if (part instanceof Equipable) {

                var old_limb = part.remember();
                if (old_limb) {

                    part.forget();
                    equipable.remember(old_limb);
                }
                var replaced = part.replace(equipable);
                this.skeleton.set_images(equipable.img_data, part_name, true);
                equipable.actor = this;
                this.trigger('unequip', this, replaced);
                this.trigger('equip', this, equipable);
                return replaced;
            } else {

                equipable.remember(part);
                part.replace(equipable);
                this.skeleton.set_images(equipable.img_data, part_name, true);
                equipable.actor = this;
                this.trigger('equip', this, equipable);
                return null;
            }
        } else {

            this.skeleton.set_part(part_name, equipable);
            if (part instanceof Equipable) {

                var replaced = part.replace(equipable);
                this.skeleton.set_images(equipable.img_data, part_name, true);
                equipable.actor = this;
                replaced.actor = null;
                this.trigger('unequip', this, replaced);
                this.trigger('equip', this, equipable);
                return replaced;
            } else {

                var replaced = part.replace(equipable);
                this.skeleton.set_images(equipable.img_data, part_name, true);
                equipable.actor = this;
                replaced.actor = null;
                this.trigger('equip', this, equipable);
                return null;
            }
        }
    }

    /**
     * Unequips the equipable limb and replaces it with a non-equipable limb
     * If no replacement, tries to restore remembered non-equipable limb.
     * If the limb is not equipable, returns false.
     * If the replacement is equipable, returns false.
     * 
     * @param {String} part_name 
     * @param {Equipable} replacement if left blank, will try to restore remembered part
     * @returns was the unequip successful? If so, return the unequipped equipable
     */
    unequip(part_name, replacement=null) {

        var part = this.skeleton.part(part_name);

        if (!(part instanceof Equipable)) {

            console.warn('WARNING: Actor>unequip: Cannot unequip a non-equipable limb.');
            return false;
        } else if (replacement instanceof Equipable) {

            console.error('ERROR: Actor>unequip: Replacement must be a non-equipable limb.');
            return false;
        } else if (replacement) {

            this.skeleton.set_part(part_name, replacement);
            var equipable = part.replace(replacement);
            this.skeleton.set_images(replacement.img_data, part_name, true);
            equipable.actor = null;
            replaced.actor = this;
            this.trigger('unequip', this, equipable);
            return equipable;
        } else if (part.remember()) {

            this.skeleton.set_part(part_name, part.remember());
            var equipable = part.replace(part.remember());
            this.skeleton.set_images(part.remember().img_data, part_name, true);
            equipable.actor = null;
            this.trigger('unequip', this, equipable);
            return equipable;
        } else {

            this.skeleton.set_part(part_name, null);
            var equipable = part.remove();
            equipable.actor = null;
            this.trigger('unequip', this, equipable);
            return equipable;
        }
    }

    /**
     * Set initial attributes specified in a data file
     * to skeleton body (root Limb).
     * 
     * @param {object} data 
     */
    init_body_from_data(data) {

        // set initial attributes specified in data file
        if (data.body.pos)
            this.skeleton.body.sprite.set_pos(
                data.body.pos[0] ?? 0,
                data.body.pos[1] ?? 0
            );
        if (data.body.ctr)
            this.skeleton.body.sprite.set_center(
                data.body.ctr[0] ?? 0,
                data.body.ctr[1] ?? 0
            );
        if (data.body.rot)
            this.skeleton.body.sprite.set_rot(
                data.body.rot ?? 0
            );
        if (data.body.scale)
            this.skeleton.body.sprite.set_scale2(
                data.body.scale[0] ?? 1,
                data.body.scale[1] ?? 1
            );
    }

    /**
     * Coordinates of the actor's body's center.
     * 
     * @type {Number[]} cx, cy coordinates
     */
    get position() { return this.skeleton.position; }
    set position(p) { this.skeleton.position = p; }

    /**
     * Degrees of actors' body's rotation.
     * 
     * @type {Number} degrees
     */
    get rotation() { return this.skeleton.rotation; }
    set rotation(degs) { this.skeleton.rotation = degs; }

    /**
     * Make all limbs collidable or not.
     * 
     * @type {Boolean} collidable or not
     */
    set all_limbs_collidable (bool) { this.skeleton.each((limb) => limb.collidable = bool); }

    /// (Static Constant) Actor states.
    static get WAITING_INIT ()  { return 0; }
    static get INITIALIZED  ()  { return 1; }
    static get CREATED      ()  { return 2; }
    static get DESTROYED    ()  { return 3; }

    /// (Private Static) Viewport of all actors.
    static _scene;

    /// (Private Static) Table object of grouped collidables.
    /// Only works with Sprites, Array points, SimplePolys or SimpleCircles.
    /// Format:
    ///     { 'group1' : [list of sprites/hulls/shapes/points] (reference)
    ///       'group2' : [another list of sprites/hulls/shapes/points] (reference)
    ///       ...etc
    ///     }
    static _targets = {};

    /// (Private Static) Table object of grouped actors.
    /// *note: helps with efficiency
    /// Format:
    ///     { 'group1' : [list of actors]
    ///       'group2' : [another list of actors]
    ///       ...etc
    ///     }
    static _actors = {};

    /// (Private Static) Table of quadtrees of grouped limbs.
    /// Format:
    ///     { 'group1' : Quadtree of limbs (reference)
    ///       'group2' : another Quadtree of limbs (reference)
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

    /// (Private Static) Queue of one-time create triggers.
    static _create_trigger_queue = new Queue();

    /// (Private Static) Queue of one-time destroy triggers.
    static _destroy_trigger_queue = new Queue();

    /// (Private Static) Queue of one-time action-complete triggers.
    static _action_complete_trigger_queue = new Queue();

    /// (Private) State of actor. Based partially on events
    /// that have been handled.
    _state = 0;

    /// (Private) Event, effect-function lists of actor.
    _events = {
        create : [],
        hit : [],
        destroy : [],
        delete : [],
        'action-complete' : [],
        equip : [],
        unequip : []
    }

    /// (Private) One-time event, effect-function lists of actor.
    _once_events = {
        create : new Queue(),
        hit : new Queue(),
        destroy : new Queue(),
        delete : new Queue(),
        'action-complete' : new Queue(),
        equip : new Queue(),
        unequip : new Queue()
    }

    /// id of object
    id = Nickel.UTILITY.assign_id();

    /// Skeleton inard that holds all limbs/sprites.
    skeleton;

    /// Group this bullet belongs to.
    group;

}//end class