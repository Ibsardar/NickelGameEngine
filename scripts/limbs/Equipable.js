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

import { Limb } from "../Limb.js";

export { Equipable };

/**
 * @class Equipable
 * 
 * Equipable limb.
 */
class Equipable extends Limb {

     /**
      * Default constructor.
      * 
      * @param {Viewport} scene 
      * @param {object} img_data NOT OPTIONAL
      * @param {Boolean} collidable 
      * @param {Boolean} overlap 
      * @param {Number[]} pivot default center of sprite
      */
    constructor(scene, img_data, collidable=false, overlap=true, pivot=null) {

        if (!img_data) return;
        super(scene, img_data, collidable, overlap, {}, pivot);
    }

    /**
     * If a limb is specified, it is remembered.
     * If not, it returns the remembered limb.
     * 
     * @param {Limb} limb 
     */
    remember(limb) {

        if (limb)
            this._replaced_limb = limb;
        else
            return this._replaced_limb;
    }

    /**
     * Forgets the remembered limb/node.
     */
    forget() {

        this._replaced_limb = null;
    }

    /// (Private) The limb that this equipable replaced.
    /// (if falsey, either it is not equipped or the replaced limb has been forgotten)
    _replaced_limb;

}//end class