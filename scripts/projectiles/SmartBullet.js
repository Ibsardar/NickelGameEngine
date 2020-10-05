////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Smart, Sticky, Bullet, Projectile
//  Filename:       SmartBullet.js
//  Date:           6/8/2019
//  Description:    Class that describes a smart bullet projectile.
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

import { StickyBullet } from "./StickyBullet.js";

import { AvoidComponent } from "./AvoidComponent.js"
import { BoidsComponent } from "./BoidsComponent.js";
import { FleeComponent } from "./FleeComponent.js";
import { FollowComponent } from "./FollowComponent.js";
import { LimitComponent } from "./LimitComponent.js";
import { SeekComponent } from "./SeekComponent.js";
import { SteerComponent } from "./SteerComponent.js";
import { WanderComponent } from "./WanderComponent.js";

export { SmartBullet };

/**
 * @class SmartBullet
 * @todo give smart bullets ability to perform a behavior
 * multiple times but with different parameters.
 * 
 * Describes a smart bullet of various properties.
 * Utilizes the Locomotive object for its "smartness"
 */
class SmartBullet extends StickyBullet {

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
     * - > .is_sticky : enables/disables stickiness (default false)
     * - > .sticktime : amount of time (ms) to be sticking
     * - > .interval : amount of time (ms) between interval effects while sticking (> 0)
     * - > .snd_stick : (optional) sound effect on stick
     * - > .snd_interval : (optional) sound effect on interval
     * - > .on_stick : (optional) stick event trigger function
     * - > .on_interval : (optional) interval event trigger function
     * 
     * SmartBullet specific params:
     * - > .behaviors : list of objects representing different steering behaviors
     *   > - .seek : seek from a list of targets
     *   > > - .targets : Array of Sprites
     *   > > - .radius : Number
     *   > > - .weight : (optional) Number (default = 1)
     *   > > - .priority : function(bullet, target, distance, target_ctr) -> Number (default priority = closest target) (lower number = higher priority)
     *   > - .flee : flees from a list of targets
     *   > > - .targets : Array of Sprites
     *   > > - .radius : Number
     *   > > - .weight : (optional) Number (default = 1)
     *   > > - .priority : function(bullet, target, distance, target_ctr) -> Number (default priority = closest target) (lower number = higher priority)
     *   > - .wander : wanders randomly
     *   > > - .weight : (optional) Number (default = 1)
     *   > > - .smooth : (optional) Number [0 to 100] (default = 50)
     *   > > - .max : (optional) Number [1 to 360] (maximum wandering angle) (default = )
     *   > - .limit : limits max and min speed
     *   > > - .min : Number
     *   > > - .max : Number
     *   > - .follow : follows a given path
     *   > > - .path : Array of Points (2-value Array) or Sprites
     *   > > - .seek_radius : Number
     *   > > - .arrive_radius : (optional) Number (default = 0 meaning NO arrival at path nodes)
     *   > > - .weight : (optional) Number (default = 1)
     *   > > - .patrol : (optional) Boolean (default = false)
     *   > - .boids : behaves like a BOID (cohere, separate, align) with a set of targets
     *   > > - .targets : Array of Sprites
     *   > > - .align_radius : Number
     *   > > - .cohere_radius : Number
     *   > > - .separate_radius : Number
     *   > > - .boids_weight : (optional) Number (default = 1)
     *   > > - .align_weight : (optional) Number (default = 1)
     *   > > - .cohere_weight : (optional) Number (default = 1)
     *   > > - .separate_weight : (optional) Number (default = 1)
     *   > - .avoid : avoids from a list of targets (highest priority = closest)
     *   > > - .targets : Array of Sprites
     *   > > - .radius : Number
     *   > > - .weight : (optional) Number (default = 1)
     *   > > - .sight : (optional) Number (default = 10)
     */
    constructor(scene, bdata) {

        // disable stickiness by default
        if (bdata.is_sticky == null || bdata.is_sticky == undefined)
            bdata.is_sticky = false;

        // call super after stickiness has been handled
        super(scene, bdata);

        // reset state (init not done yet)
        this._state = SmartBullet.WAITING_INIT;

        // convert sprite into locomotive
        this.sprite = Locomotive({
            scene: scene,
            sprite: this.sprite
        });

        // add smart bullet to specialized list of projectiles
        // * note: if group does not exist, it will be created *
        if (SmartBullet._p_smarties[this.group])
            SmartBullet._p_smarties[this.group].push(this);
        else
            SmartBullet._p_smarties[this.group] = [this];

        // attach behaviors:
        // -> attach before main update
        if (bdata.behaviors.seek) SeekComponent.attach(this, bdata.behaviors.seek);
        if (bdata.behaviors.flee) FleeComponent.attach(this, bdata.behaviors.flee);
        if (bdata.behaviors.wander) WanderComponent.attach(this, bdata.behaviors.wander);
        if (bdata.behaviors.follow) FollowComponent.attach(this, bdata.behaviors.follow);
        if (bdata.behaviors.boids) BoidsComponent.attach(this, bdata.behaviors.boids);
        if (bdata.behaviors.avoid) AvoidComponent.attach(this, bdata.behaviors.avoid);
        // -> always attached right before limiter
        SteerComponent.attach(this);
        if (bdata.behaviors.limit) LimitComponent.attach(this, bdata.behaviors.limit);

        // set state to steering on creation
        this.once('create', function(p) {
            p._state = SmartBullet.STEERING;
        });

        // set state
        this._state = SmartBullet.INITIALIZED;
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // skip if destroyed
        if (this._state == SmartBullet.DESTROYED)
            return;

        // reset steering vector
        this._steering_vector = [0,0];

        // reinstate correct speed
        this.speed = this._smart_speed;

        // call attached functions
        for (let f of this._attached) f();

        // update bullet
        super.update();
    }

    /**
     * Static function: Triggers events based on current state of smart bullets.
     * Must be called at regular intervals (ex: 60 times per second i.e. 60fps).
     */
    static handle_triggers() {

        // handle SmartBullet-specific triggers
        // ...
    }

    /**
     * Static function: removes all targets, projectiles, and their
     * quadtree for a certian group. Does not trigger delete event by
     * default. Does not internally destroy projectiles by default.
     * * note: will delete non-SmartBullet projectiles in the given group
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // delete from projectile list
        StickyBullet.delete_group(group, trigger);

        // delete smart bullet list
        delete SmartBullet._p_smarties[group];
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
        //StickyBullet.delete_destroyed(trigger);

        // delete from this class
        var ps = SmartBullet._p_smarties;

        // remove empty groups
        for (var i in ps) 
            if (!ps[i] || !ps[i].length)
                delete ps[i];
        
        // remove dead objects
        for (var g in ps)
            ps[g] = ps[g].filter(p => p && p._state != SmartBullet.DESTROYED);
    }

    /**
     * @overrides parent class function.
     * Resets all static data to the default values.
     * If deep is false, then do not reset parent class.
     */
    static reset(deep=true) {

        if (deep) StickyBullet.reset();
        SmartBullet._p_smarties = {};
    }
    
    /**
     * Static property: Number of smart bullets.
     * (includes destroyed, excludes deleted)
     * 
     * @type {Number} smart bullet count
     */
    static get count() {
        var c = 0;
        for (var g in SmartBullet._p_smarties)
            c += SmartBullet._p_smarties[g].length;
        return c;
    }

    /**
     * Override: Base speed of the bullet, now also manages smart speed.
     * 
     * @type {Number}
     */
    get speed() { return this.sprite.get_speed(); }
    set speed(spd) { this._smart_speed = spd; this.sprite.set_speed(spd);  }

    /// (Static Constant) Additional SmartBullet state.
    static get STEERING() { return 5; }

    /// (Private Static) List of SmartBullet Projectiles
    /// Format:
    ///     { 'group1' : [list of smart projectiles]
    ///       'group2' : [another list of smart projectiles]
    ///       ...etc
    ///     }
    static _p_smarties = {};

    /// (Private) The steering vector will be applied every frame
    /// to the SmartBullet's 'sprite'.
    _steering_vector = [0,0];

    /// (Private) Dictionary of all behavior variables
    _bhv = {};

    /// (Private) List of additional functions called in update
    _attached = [];

    /// (Private) Much more consistent speed than sprite speed; not affected by behaviors
    _smart_speed = 0;

}//end SmartBullet