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

import { Weapon } from "./Weapon.js";

export { MeleeWeapon };

/**
 * @class MeleeWeapon
 * 
 * MeleeWeapons are weapons with only melee attack capabilities.
 */
class MeleeWeapon extends Weapon {

    /**
     * Default constructor.
     */
    constructor(scene, data, collidable, overlap, pivot) {
        
        super(scene, data, collidable, overlap, pivot);
    }

}//end class