////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           10/10/2020
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

export { Collidable };

/**
 * @interface Collidable
 * 
 * An interface that enforces collision behaviour.
 * 
 * *** Note: implements well with Spriteable ***
 */
class Collidable {
    
    /**
     * @interface
     * Indicates wether the collidable is colliding with an object or not.
     * @param {Object} obj
     * @returns {Boolean}
     */
    colliding_with (obj) {}
    
    /**
     * @todo add appropriate params for resolve_with
     * 
     * @interface
     * Indicates wether the collidable is colliding with an object or not.
     * If colliding, also resolve the collision.
     * @param {Object} obj
     * @param {Boolean} resolve_me should i be re-positioned so that i do not infringe you?
     * @param {Boolean} resolve_you should you be re-positioned so that you do not infringe me?
     * @param {Number} my_heaviness how difficult am i to re-position?
     * @param {Number} your_heaviness how difficult are you to re-position?
     * @param {null|[Number,Number]} my_velocity current velocity of me. if null, no velocity correction
     * @param {null|[Number,Number]} your_velocity current velocity of you. if null, no velocity correction
     * @returns {Boolean}
     */
    resolve_with (obj, resolve_me=true, resolve_you=true, my_heaviness=1,
        your_heaviness=1, my_velocity=null, your_velocity=null) {}
    
    /**
     * @interface
     * Indicates wether the collidable has collisions enabled or not.
     * @returns {Boolean}
     */
    is_collidable () {}

    /**
     * @interface
     * Returns bounds for collision-checking like so: [x,y,w,h]
     * @returns {Number[]}
     */
    get_bounds_for_qt () {}

}//end Collidable