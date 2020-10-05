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

export { SmallCanoptekClaw };

/**
 * @class SmallCanoptekClaw
 * 
 * SmallCanoptekClaws is a low-teir melee weapon of the Canoptek Necron.
 */
class SmallCanoptekClaw extends MeleeWeapon {

    /**
     * Default constructor.
     */
    constructor(overlap=true) {

        var data = DATA.IMG.NECRON_WEAP_03;

        super(GaMa.scene, data, false, overlap, data);
    }

    update() {
        
        super.update();
    }

}//end class