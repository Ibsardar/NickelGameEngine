////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Actor
//  Filename:       Actor.js
//  Date:           10/3/2020
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
 * *** @EXPERIMENTAL ***
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

        // add event responses (default: no response)
        if (adata.on_create) this.on('create', adata.on_create);
        if (adata.on_hit) this.on('hit', adata.on_hit);
        if (adata.on_destroyed) this.on('destroy', adata.on_destroyed);
        if (adata.on_delete) this.on('delete', adata.on_delete);
        if (adata.on_action_complete) this.on('action-complete', adata.on_action_complete);

        // increment counts
        Actor._count++

        // trigger create event
        this._state = Actor.CREATED;
        self.trigger('create', self);
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
    * Number of actors in all groups.
    * (excludes destroyed)
    * 
    * @type {Number} actor count
    */
    static get count() { return Actor._count; }

    /**
    * Number of destroyed actors in all groups.
    * 
    * @type {Number} actor count
    */
    static get dead_count() { return Actor._dead_count; }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // check destroy trigger
        if (this.sprite.is_destroyed() && this._state != Actor.DESTROYED) {
            Actor._count--;
            Actor._dead_count++;
            this._state = Actor.DESTROYED;
            this.trigger('destroy', this);
            return;
        }

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

        // destroy sprite
        this.sprite.destroy();
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
     * Resets all static data to the default values.
     */
    static reset() {

        Actor._scene = null;
        Actor._create_trigger_queue = new Queue();
        Actor._destroy_trigger_queue = new Queue();
        Actor._action_complete_trigger_queue = new Queue();
        Actor._count = 0;
        Actor._dead_count = 0;
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

    /// (Private Static) Actor count tracking
    static _count = 0;
    static _dead_count = 0;
    static _dead_counts = {}
    static _counts = {}

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

}//end class