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

export { HybridWeapon };

/**
 * @class HybridWeapon
 * 
 * HybridWeapons are weapons with both melee and ranged attack capabilities.
 * Ranged attacks are conducted via projectiles.
 */
class HybridWeapon extends Weapon {

     /**
      * Default constructor.
      */
    constructor(scene, data, collidable, overlap, pivot, projectile_data) {
        
        super(scene, data, collidable, overlap, pivot);
        this._projectile_data = projectile_data;
    }

    _projectile_data;

}//end class