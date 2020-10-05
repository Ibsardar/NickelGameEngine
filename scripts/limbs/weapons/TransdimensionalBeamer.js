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

export { TransdimensionalBeamer };

/**
 * @class TransdimensionalBeamer
 * 
 * TransdimensionalBeamer are mining tools that can be used as
 * weak weapons for the Canoptek Necron.
 */
class TransdimensionalBeamer extends RangedWeapon {

    /**
     * Default constructor.
     */
    constructor(overlap=true) {

        var data = DATA.IMG.NECRON_WEAP_04;

        super(GaMa.scene, data, false, overlap, data);
    
        this._projectile_data = {
            sprite_data: DATA.IMG.NECRON_PROJ_01,
            group: 'test',
            maxtime: 500,
            health: 999,
            snd_create: DATA.SND.LASER
        };

        this.key_pt('muzzle', [2,0]);
        this.key_pt('lexhaust', [1,-1]);
        this.key_pt('rexhaust', [1,1]);
    }

    update() {
        
        super.update();
    }

    shoot() {

        var b = new Bullet(GaMa.scene, this._projectile_data);
        b.position = this.get_world_pt(this.key_pt('muzzle'), true);
        b.speed = 10;
        b.direction = this.sprite.get_rot();
        return b;
    }

}//end class