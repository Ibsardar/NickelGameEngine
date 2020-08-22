////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           4/15/2020
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

export { Hazard };

/**
 * @todo: must have sprite, must be collidable (so use quadtree), must have the 4 basic events, must have a condition for initiating combat...
 * 
 * @class Hazard
 * 
 * Hazards are like weapons except they are simply sprites.
 */
class Hazard {

    /**
     * Default constructor.
     */
    constructor(damage_armor_then_health=0, damage_armor_only=0, damage_health_only=0, effects=[]) {
        
        this._dmg_normal = damage_armor_then_health;
        this._dmg_break = damage_armor_only;
        this._dmg_pierce = damage_health_only;
        this._effects = effects;
    }

    _dmg_normal; // damage to armor, then health
    _dmg_pierce; // damage to health only
    _dmg_break; // damage to armor only
    _effects = []; // effects applied on hit

}//end class