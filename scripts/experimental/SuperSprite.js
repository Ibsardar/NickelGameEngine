////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           10/3/2020
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

import { AbstractSuperSprite } from "./AbstractSuperSprite.js";

export { SuperSprite };

/**
 * @class SuperSprite
 * 
 * An optionally abstract class that improves the capability of
 * the standard sprite/locomotive.
 */
class SuperSprite extends AbstractSuperSprite {

    /**
     * 
     * @param {Viewport} scene 
     * @param {{
     *      sprite_data : {},
     *      sprite : Sprite,
     *      bounds : {
     *          left,
     *          right,
     *          top,
     *          bottom
     *      },
     *      before_effect : () => {},
     *      after_effect : () => {},
     *      on_create : () => {},
     *      on_hit : () => {},
     *      on_destroyed : () => {},
     *      on_delete : () => {}
     * }} data data containing options
     * - > .sprite_data : data for Sprite creation (mandatory if sprite is empty)
     * - > .sprite : Sprite object (mandatory if sprite_data is empty)
     * - > .bounds : (optional) data for projectile bounds relative to canvas
     *   > - .left : left bound
     *   > - .right : right bound
     *   > - .top : top bound
     *   > - .bottom : bottom bound
     * - > .before_effect : (optional) pre update function; called every frame
     * - > .after_effect : (optional) post update function; called every frame
     * - > .on_create : (optional) create event trigger function
     * - > .on_hit : (optional) collision event trigger function
     * - > .on_destroyed : (optional) destroy event trigger function
     * - > .on_delete : (optional) delete event trigger function
     * @param {Boolean} _trigger_ctor_evs ignore this
     */
    constructor(scene, data, _trigger_create=true) {
        super(scene);

        // exceptions
        if (!data.sprite_data && !data.sprite) {
            console.error('ERROR: SuperSprite~constructor: "data" parameter does not have either "sprite_data" or "sprite" options set.');
            return;
        }

        // add events
        SuperSprite.add_ev(this, 'create');
        SuperSprite.add_ev(this, 'hit');
        SuperSprite.add_ev(this, 'destroy');
        SuperSprite.add_ev(this, 'delete');
        
        // set sprite
        this.set_sprite(data.sprite_data ?? data.sprite);

        // set bounds
        if (data.bounds) this.set_bounds(data.bounds);

        // set script effects (default: none)
        if (data.before_effect) this.update_before = data.before_effect;
        if (data.after_effect) this.update_more = data.after_effect;

        // add event responses (default: no response)
        if (data.on_create) this.on('create', data.on_create);
        if (data.on_hit) this.on('hit', data.on_hit);
        if (data.on_destroyed) this.on('destroy', data.on_destroyed);
        if (data.on_delete) this.on('delete', data.on_delete);

        this._state = SuperSprite.INITIALIZED_SUPERSPRITE;

        // trigger create event
        if (_trigger_create) {
            this._state = SuperSprite.CREATED;
            this.trigger('create', this);
        }
    }
    
    //
    // statics
    //

    static reset () {

        SuperSprite._count = 0;
        SuperSprite._dead_count = 0;
    }

    static get count () { return SuperSprite._count; }
    static get dead_count () { return SuperSprite._dead_count; }
    static get sprite () { return this._sprite; }
    static get left_bound () { return this._bounds[0]; }
    static get bottom_bound () { return this._bounds[1]; }
    static get right_bound () { return this._bounds[2]; }
    static get top_bound () { return this._bounds[3]; }

    static get INITIALIZED_SUPERSPRITE  ()  { return 3; }
    static get CREATED                  ()  { return 100; }
    static get DESTROYED                ()  { return 1000; }

    static _count = 0;
    static _dead_count = 0;

    //
    // non-statics
    //

    /**
     * @interface
     * Updates the super sprite.
     * 
     */
    update () {
       
        // check destroy trigger
        if (this._sprite.is_destroyed() && this._state != SuperSprite.DESTROYED) {
            SuperSprite._count--;
            SuperSprite._dead_count++;
            this._state = SuperSprite.DESTROYED;
            this.trigger('destroy', this);
            return;
        }

        // update
        this.update_before();
        this._sprite.update();
        this.update_after();
    }
    
    /**
     * @interface
     * Creates a basic copy of the super sprite.
     * 
     * *** Note: does not copy event or pre/post update functions ***
     * 
     */
    copy () {
        return new SuperSprite(this.scene, {
            sprite : this._sprite.copy_base(),
            bounds : this._bounds ? {
                left : this._bounds[0],
                bottom : this._bounds[1],
                right : this._bounds[2],
                top : this._bounds[3]
            } : null,
        });
    }
    
    /**
     * @interface
     * Destroys the super sprite.
     * 
     */
    destroy (trigger_now=false) {
        this.sprite.destroy();
        if (trigger_now) {
            SuperSprite._count--;
            SuperSprite._dead_count++;
            this._state = SuperSprite.DESTROYED;
            this.trigger('destroy', this);
        }
    }

    /**
     * Creates a new Sprite and sets it.
     * 
     * @param {{img, w, h}|Sprite} sprite_data_or_sprite
     */
    set_sprite(sprite_data_or_sprite) {

        if (sprite_data_or_sprite instanceof Sprite) {
            
            // set sprite
            this._sprite = sprite_data_or_sprite;
            if (this._sprite.hull)
                this._collidable = true;
            else
                this._collidable = false;
        } else {

            // set sprite + circle collision hull + make sprite's center the origin
            this._sprite = new Sprite(this.scene, sprite_data, true, false);
            var hull = new ColliderHull(this._sprite, false);
            var max_side = Math.max(this._sprite.get_w(), this._sprite.get_h());
            var shape = new SimpleCircle(scene, max_side * 0.5); // 50% of max side
            this._sprite.set_origin_centered();
            shape.set_center(this._sprite.get_center());
            hull.set_shape(shape);
            this._sprite.set_hull(hull);
            this._collidable = true;
        }
    }

    /**
     * Sets bounds of destruction.
     * 
     * @param  {{left, bottom, right, top}} bounds
     */
    set_bounds(bounds) {

        this._bounds = [
            bounds.left,
            bounds.bottom,
            bounds.right,
            bounds.top
        ];

        var bnd = this._bounds;
        var spr = this._sprite;
        this._sprite.bound = () => {
            var r = spr.get_right();
            var t = spr.get_top();
            var l = spr.get_left();
            var b = spr.get_bottom();

            if (r < bnd[0] ||
                t > bnd[1] ||
                l > bnd[2] ||
                b < bnd[3]) {

                spr.destroy();
            }
        }
    }

    /**
     * Turn super sprite towards an x,y point or another sprite gradually.
     * If max_rot is very large, the turn will be instant.
     * 
     * @param {[number,number]|Sprite|SuperSprite} target 
     */
    turn_to(target) {

        if (target instanceof SuperSprite) this._sprite.turn_to(target._sprite, false);
        else if (target instanceof Sprite) this._sprite.turn_to(target, false);
        else console.error('ERROR: SuperSprite>turn_to: cannot turn to a target that is not a Sprite, SuperSprite, or an x,y coordinate.');
    }

    get position() { return this.sprite.get_center(); }
    set position(c) { this.sprite.set_center(c[0], c[1]); }
    get speed() { return this.sprite.get_speed(); }
    set speed(spd) { this.sprite.set_speed(spd); }
    get acceleration() { return this.sprite.get_accel(); }
    set acceleration(acc) { this.sprite.set_accel(acc); }
    get direction() { return this.sprite.get_dir(); }
    set direction(dir) { this.sprite.set_turn(dir); }
    get max_rotation() { return this.sprite.get_rot_max(); }
    set max_rotation(arc) { this.sprite.set_rot_max(arc); }
    get scale() { return this.sprite.get_scale(); }
    set scale(s) { this.sprite.set_scale2(s[0], s[1]); }
    get size() { return [this.sprite.get_w(), this.sprite.get_h()]; }
    get width() { return this.sprite.get_w(); }
    get height() { return this.sprite.get_h(); }
    
    /**
     * Is the projectile collidable or not.
     * 
     * @type {Boolean} collidable or not
     */
    get collidable () { return this._collidable; }
    set collidable (bool) {
        this._collidable = bool;
        if (this._collidable && !this._sprite.hull) {
            console.error('ERROR: SuperSprite>set collidable: sprite does not have a hull so super sprite cannot be collidable.');
            this._collidable = false;
        }
    }

    _sprite;

    // left, bottom, right, top
    _bounds;
    
    _collidable;

}//end SuperSprite