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

import { MeleeWeapon } from "../MeleeWeapon.js";
import { GaMa } from "../../managers/GameManager.js";
import { DATA } from "../../data_loader2.js";

export { ScalpelClaw };

/**
 * @class ScalpelClaw
 * 
 * ScalpelClaws is a medium-teir melee weapon of the Necron.
 */
class ScalpelClaw extends MeleeWeapon {

    /**
     * Default constructor.
     */
    constructor(overlap=true) {

        var data = DATA.IMG.NECRON_WEAP_02;

        super(GaMa.scene, data, false, overlap, data);
    }

    update() {
        
        super.update();
    }

}//end class