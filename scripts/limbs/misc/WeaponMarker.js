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

import { Weapon } from "../Weapon.js";
import { GaMa } from "../../managers/GameManager.js";
import { DATA } from "../../data_loader2.js";

export { WeaponMarker };

/**
 * @class WeaponMarker
 * 
 * WeaponMarkers is used for testing.
 */
class WeaponMarker extends Weapon {

    /**
     * Default constructor.
     */
    constructor(overlap=true) {

        var data = DATA.IMG.RED_MARKER;

        super(GaMa.scene, data, false, overlap, data);
    }

    update() {
        
        super.update();
    }

}//end class