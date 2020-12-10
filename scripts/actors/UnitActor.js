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

import { Actor } from "../Actor.js";

export { UnitActor };

/**
 * @class UnitActor
 * 
 * Unit-specific actor.
 */
class UnitActor extends Actor {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param ...
     */
    constructor(scene, skeleton) {

        super(scene, {skeleton: skeleton});
    }

    // HERE... (Effects look good... here, we must call certain effects when getting hit, when hitting, and on-update........figure out how to distnguish these calls - should be easy)

    _name;
    _health = 0;
    _armor = 0;
    _effects = []; // effects to run when getting hit
    _resists = []; // list of resistance to effects
    _race;
    _team;
    
}//end class