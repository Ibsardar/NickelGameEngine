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

import { Equipable } from "./Equipable.js";

export { Weapon };

/**
 * @class Weapon
 * 
 * Weapons are limbs with offensive properties used in combat.
 */
class Weapon extends Equipable {

     /**
      * Default constructor.
      */
    constructor(scene, data, collidable, overlap, pivot, damage_armor_then_health=0, damage_armor_only=0, damage_health_only=0, effects=[]) {
        
        super(scene, data, collidable, overlap, pivot);
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