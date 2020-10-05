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

import { RangedWeapon } from "../RangedWeapon.js";
import { GaMa } from "../../managers/GameManager.js";
import { Bullet } from "../../projectiles/Bullet.js";
import { DATA } from "../../data_loader2.js";

export { GaussRifle };

/**
 * @class GaussRifle
 * 
 * GaussRifles is a medium-teir weapon of the Necron.
 */
class GaussRifle extends RangedWeapon {

    /**
     * Default constructor.
     */
    constructor(overlap=true) {

        var data = DATA.IMG.NECRON_WEAP_01;

        super(GaMa.scene, data, false, overlap, data);
    
        this._projectile_data = {
            sprite_data: DATA.IMG.NECRON_PROJ_01,
            group: 'test',
            maxtime: 3000,
            health: 999,
            snd_create: DATA.SND.LASER
        };

        this.key_pt('muzzle', [7,0]);
        this.key_pt('exhaust', [2,-1]);
    }

    update() {
        
        super.update();
    }

    shoot() {

        var b = new Bullet(GaMa.scene, this._projectile_data);
        b.position = this.get_world_pt(this.key_pt('muzzle'), true);
        b.speed = 4;
        b.direction = this.sprite.get_rot();
        //this._bullets.push(b);
        return b;
    }

    // junk... don't think i need it... if you want to link the bullet to this gun, just set a callback into the bullet
    /// (Private) List of bullets from this gun
    //_bullets = [];

}//end class