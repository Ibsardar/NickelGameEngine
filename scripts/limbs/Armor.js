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

export { Armor };

/**
 * @class Armor
 * 
 * Armors are limbs with defensive properties used in combat.
 * 
 * *Note:* If you want an armor without a limb, then use
 * an effect directly in an Actor.
 */
class Armor extends Equipable {

     /**
      * Default constructor.
      */
    constructor(scene, data, collidable, overlap, pivot, armor=0, effects=[]) {
        
        super(scene, data, collidable, overlap, pivot);
        this._armor = armor;
        this._effects = effects;
    }

    _armor;
    _effects = []; // effects to run when getting hit
    _resists = []; // list of resistance to effects

}//end class