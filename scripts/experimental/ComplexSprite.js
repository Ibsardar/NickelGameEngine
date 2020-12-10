import { implement, isinterface } from "../managers/ImplementsManager.js";
////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           10/5/2020
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
import { implement } from "../managers/ImplementsManager.js";
import { Spriteable } from "./Spriteable.js";
import { MultiSpriteable } from "./MultiSpriteable.js";

export { ComplexSprite };

/**
 * @class ComplexSprite
 * @implements Spriteable
 * 
 * An optionally abstract class that improves the capability of
 * any non-Sprite object that behaves like a sprite.
 */
class ComplexSprite extends AbstractSuperSprite {

    /**
     * 
     * @param {Viewport} scene 
     * @param {{
     *      complex_object : Spriteable|MultiSpriteable,
     *      before_effect : () => {},
     *      after_effect : () => {},
     *      on_create : () => {},
     *      on_hit : () => {},
     *      on_destroyed : () => {},
     *      on_delete : () => {}
     * }} data data containing options
     * - > .complex_object : object that holds a sprite within itself somehow
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
        if (!complex_object) {
            console.error('ERROR: ComplexSprite~constructor: "data" parameter does not have "complex_object" option set.');
            return;
        }
        if (!isinterface(MultiSpriteable).of(complex_object) &&
            !isinterface(Spriteable).of(complex_object)) {
            console.error('ERROR: ComplexSprite~constructor: "complex_object" does not implement MultiSpriteable nor Spriteable.');
            return;
        }

        // add events
        ComplexSprite.add_ev(this, 'create');
        ComplexSprite.add_ev(this, 'hit');
        ComplexSprite.add_ev(this, 'destroy');
        ComplexSprite.add_ev(this, 'delete');
        
        // set object
        this._subject = data.complex_object;

        // set script effects (default: none)
        if (data.before_effect) this.update_before = data.before_effect;
        if (data.after_effect) this.update_more = data.after_effect;

        // add event responses (default: no response)
        if (data.on_create) this.on('create', data.on_create);
        if (data.on_hit) this.on('hit', data.on_hit);
        if (data.on_destroyed) this.on('destroy', data.on_destroyed);
        if (data.on_delete) this.on('delete', data.on_delete);

        this._state = ComplexSprite.INITIALIZED_COMPLEXSPRITE;

        // trigger create event
        if (_trigger_create) {
            this._state = ComplexSprite.CREATED;
            this.trigger('create', this);
        }
    }
    
    //
    // statics
    //

    static reset () {

        ComplexSprite._count = 0;
        ComplexSprite._dead_count = 0;
    }

    static get count () { return ComplexSprite._count; }
    static get dead_count () { return ComplexSprite._dead_count; }
    static get subject () { return this._subject; }

    static get INITIALIZED_COMPLEXSPRITE    () { return 3; }
    static get CREATED                      () { return 100; }
    static get DESTROYED                    () { return 1000; }

    static _count = 0;
    static _dead_count = 0;

    //
    // non-statics
    //

    /**
     * @interface
     * Updates the complex sprite.
     * 
     */
    update () {
       
        // check destroy trigger
        if (this._subject.is_destroyed() && this._state != ComplexSprite.DESTROYED) {
            ComplexSprite._count--;
            ComplexSprite._dead_count++;
            this._state = ComplexSprite.DESTROYED;
            this.trigger('destroy', this);
            return;
        }

        // update
        this.update_before();
        this._subject.update();
        this.update_after();
    }
    
    /**
     * @interface
     * Creates a copy of the complex sprite.
     * 
     * *** Note: does not copy event or pre/post update functions ***
     */
    copy () {
        return new ComplexSprite(this.scene, {
            complex_object : this._subject.copy(),
        });
    }
    
    /**
     * @interface
     * Destroys the complex sprite.
     * 
     */
    destroy (trigger_now=false) {
        this._subject.destroy();
        if (trigger_now) {
            ComplexSprite._count--;
            ComplexSprite._dead_count++;
            this._state = ComplexSprite.DESTROYED;
            this.trigger('destroy', this);
        }
    }

    /**
     * @interface
     * Is underlying spriteable|multispriteable destroyed?
     * 
     * @returns {Boolean}
     */
    is_destroyed () {
        return this._subject.is_destroyed();
    }

    _subject;

}//end ComplexSprite