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

export { MultiSpriteable };

/**
 * @interface MultiSpriteable
 * 
 * An interface that enforces sprite-like behaviour for
 * a class that contains multiple Spriteables within it.
 */
class MultiSpriteable {

    /**
     * @interface
     * Updates the multi-spriteable.
     */
    update () {}
    
    /**
     * @interface
     * Creates a basic copy of the multi-spriteable.
     * @returns {MultiSpriteable}
     */
    copy () {}
    
    /**
     * @interface
     * Destroys the multi-spriteable.
     */
    destroy () {}
    
    /**
     * @interface
     * Indicates wether the multi-spriteable is destroyed or not.
     * @returns {Boolean}
     */
    is_destroyed () {}
    
    /**
     * @interface
     * Indicates wether the object is self.
     * @param {Object} obj
     * @returns {Boolean}
     */
    same_as (obj) {}

    /**
     * @interface
     * Loops through each Spriteable contained within via a callback.
     * @param {(spriteable) => {}} callback
     */
    each_spriteable (callback = (spriteable) => {}) {}

}//end MultiSpriteable