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

import { UnitActor } from "../UnitActor.js";
import { GaMa } from "../../managers/GameManager.js";
import { CanoptekWraithSkeleton } from "../../skeletons/CanoptekWraithSkeleton.js";
import { DATA } from "../../data_loader2.js";
import { SmallCanoptekClaw } from "../../limbs/weapons/SmallCanoptekClaw.js";
import { TransdimensionalBeamer } from "../../limbs/weapons/TransdimensionalBeamer.js";

export { NecronCanoptekWraith };

/**
 * @class NecronCanoptekWraith
 * 
 * Necron's heavy repair unit.
 */
class NecronCanoptekWraith extends UnitActor {

    /**
     * Default constructor.
     * 
     * @param {String} group 
     * @param {String} team
     */
    constructor(group, team) {

        var wraith_sk = new CanoptekWraithSkeleton();
        wraith_sk.set_images(NecronCanoptekWraith.data, 'all', true);

        super(GaMa.scene, wraith_sk, group);

        this.init_body_from_data(NecronCanoptekWraith.data);

        var lclaw = new SmallCanoptekClaw();
        this.equip(lclaw, 'lhand');
        lclaw.flip_v(true);
        this.skeleton.part('larm').flip_v(true);
        this.skeleton.part('larm').offset_position = [-1,-3];
        
        var rclaw = new SmallCanoptekClaw();
        this.equip(rclaw, 'rhand');

        var lbeamer = new TransdimensionalBeamer();
        this.equip(lbeamer, 'ltool');
        
        var rbeamer = new TransdimensionalBeamer();
        this.equip(rbeamer, 'rtool');

        // TODO: fix joints - they are a bit off...

        // junk
        this.skeleton.part('lf_claw').offset_rotation = 115;
        this.skeleton.part('lm_claw').offset_rotation = 115;
        this.skeleton.part('lr_claw').offset_rotation = 115;
        this.skeleton.part('rf_claw').offset_rotation = -115;
        this.skeleton.part('rm_claw').offset_rotation = -115;
        this.skeleton.part('rr_claw').offset_rotation = -115;
        this.skeleton.part('larm').offset_rotation = 35;
        this.skeleton.part('rarm').offset_rotation = -55;
        this.skeleton.part('rhand').offset_rotation = 65;
        this.skeleton.part('lhand').offset_rotation = -95;

        this._team = team;
    }
    
    /**
     * Returns body part img data in the format:
     * 'body' : img_data
     * ...
     */
    get_data = () => NecronCanoptekWraith.data;

    /// image data for default body parts.
    static data = {
        body: DATA.IMG.NECRON_BODY_02,
        larm: DATA.IMG.NECRON_PART_06,
        rarm: DATA.IMG.NECRON_PART_06,
        back: DATA.IMG.NECRON_PART_07,
        tail: DATA.IMG.NECRON_PART_04,
        lf_claw: DATA.IMG.NECRON_PART_05,
        lm_claw: DATA.IMG.NECRON_PART_05,
        lr_claw: DATA.IMG.NECRON_PART_05,
        rf_claw: DATA.IMG.NECRON_PART_05,
        rm_claw: DATA.IMG.NECRON_PART_05,
        rr_claw: DATA.IMG.NECRON_PART_05,
        lhand: null,
        rhand: null,
        ltool: null,
        rtool: null
    }
    
}//end class