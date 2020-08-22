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

export { RangedWeapon };

/**
 * @class RangedWeapon
 * 
 * RangedWeapons are weapons with only ranged attack capabilities.
 * Attacks are conducted via projectiles.
 */
class RangedWeapon extends Weapon {

     /**
      * Default constructor.
      */
    constructor(scene, data, collidable, overlap, pivot, projectile_data) {
        
        super(scene, data, collidable, overlap, pivot);
        this._projectile_data = projectile_data;
    }

    _projectile_data;

}//end class