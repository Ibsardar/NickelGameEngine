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

export { Spriteable };

/**
 * @interface Spriteable
 * 
 * An interface that enforces sprite-like behaviour.
 */
class Spriteable {

    /**
     * @interface
     * Updates the spriteable.
     */
    update () {}
    
    /**
     * @interface
     * Creates a basic copy of the spriteable.
     * @returns {Spriteable}
     */
    copy () {}
    
    /**
     * @interface
     * Destroys the spriteable.
     */
    destroy () {}
    
    /**
     * @interface
     * Indicates wether the spriteable is destroyed or not.
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

}//end Spriteable