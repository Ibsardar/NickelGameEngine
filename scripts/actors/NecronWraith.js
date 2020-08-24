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

import { UnitActor } from "./UnitActor.js";
import { GaMa } from "../managers/GameManager.js";
import { WraithSkeleton } from "../skeletons/WraithSkeleton.js";
import { DATA } from "../data_loader2.js";
import { ScalpelClaw } from "../limbs/weapons/ScalpelClaw.js";
//import { LivingMetal } from "../armors/LivingMetal.js";   @todo

export { NecronWraith };

/**
 * @class NecronWraith
 * 
 * Necron's heavy melee unit.
 */
class NecronWraith extends UnitActor {

    /**
     * Default constructor.
     * 
     * @param {String} group 
     * @param {String} team
     */
    constructor(group, team) {

        var wraith_sk = new WraithSkeleton();
        wraith_sk.set_images(NecronWraith.data, 'all', true);

        super(GaMa.scene, wraith_sk, group);

        this.init_body_from_data(NecronWraith.data);

        var lclaw = new ScalpelClaw();
        this.equip(lclaw, 'lhand');
        
        var rclaw = new ScalpelClaw();
        this.equip(rclaw, 'rhand');
        rclaw.sprite.flip_v(true);

        this._team = team;
    }
    
    /**
     * Returns body part img data in the format:
     * 'body' : img_data
     * ...
     */
    get_data = () => NecronWraith.data;

    /// image data for default body parts.
    static data = {
        body: DATA.IMG.NECRON_BODY_02,
        larm: DATA.IMG.NECRON_PART_01,
        rarm: DATA.IMG.NECRON_PART_01,
        back: DATA.IMG.NECRON_PART_03,
        lfarm: DATA.IMG.NECRON_PART_02,
        lfarm: DATA.IMG.NECRON_PART_02,
        tail: DATA.IMG.NECRON_PART_04,
        lhand: null,
        rhand: null
    }
    
}//end class