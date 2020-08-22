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

        var img_data = DATA.IMG.NECRON_WEAP_01;
        var pivot = DATA.IMG.NECRON_WEAP_01.pivot;

        super(GaMa.scene, img_data, false, overlap, pivot);
    
        this._projectile_data = {
            sprite_data: DATA.IMG.NECRON_PROJ_01,
            group: 'test',
            maxtime: 3000,
            health: 999,
            snd_create: DATA.SND.LASER
        };
    }

    update() {

        for (var i=0; i<this._bullets.length; i++)
            this._bullets[i].update();
        
        super.update();
    }

    shoot() {

        var b = new Bullet(GaMa.scene, this._projectile_data);
        b.position = this.sprite.get_right();
        b.speed = 4;
        b.direction = this.sprite.get_rot();
        this._bullets.push(b);
        return b;
    }

    /// (Private) List of bullets from this gun
    _bullets = [];

}//end class