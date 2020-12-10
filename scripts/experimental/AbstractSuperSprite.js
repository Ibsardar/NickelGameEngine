import { implement } from "../managers/ImplementsManager.js";
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

import { Eventable } from "./Eventable.js";
import { Spriteable } from "./Spriteable.js";

export { AbstractSuperSprite };

/**
 * @class AbstractSuperSprite
 * 
 * Abstract class that provides basic functions that a sprite-like
 * class would utilize.
 */
class AbstractSuperSprite extends Eventable {

    /// Default constructor.
    constructor(scene) { 

        this._state = AbstractSuperSprite.INITIALIZING;

        this._scene = scene;
        AbstractSuperSprite._count++;
        
        this._state = AbstractSuperSprite.INITIALIZED_ABSTRACTSUPERSPRITE;
    }

    //
    // statics
    //

    static reset () {

        AbstractSuperSprite._count = 0;
        AbstractSuperSprite._dead_count = 0;
    }

    static get count () { return AbstractSuperSprite._count; }
    static get dead_count () { return AbstractSuperSprite._dead_count; }

    static get INITIALIZING                     ()  { return 1; }
    static get INITIALIZED_ABSTRACTSUPERSPRITE  ()  { return 2; }

    static _count = 0;
    static _dead_count = 0;

    //
    // non-statics
    //

    /**@interface */
    update_before () {}

    /**@interface */
    update () {
        this.update_before();
        this.update_after();
    }
    
    /**@interface */
    update_after () {}
    
    /**@interface */
    copy () {
        return new AbstractSuperSprite(this.scene);
    }
    
    /**@interface */
    destroy () {}
    
    /**@interface */
    is_destroyed () {}

    /**
     * @interface
     * Indicates wether the object is self.
     * 
     * @param {Object} obj
     * @returns {Boolean}
     */
    same_as (obj) {
        return this === obj;
    }

    get scene () { return this._scene; }
    get state () { return this._state; }
    get id () { return this._id; }

    _scene;

    _state;

    _id = Nickel.UTILITY.assign_id();

}//end AbstractSuperSprite

implement(Spriteable).in(AbstractSuperSprite);
