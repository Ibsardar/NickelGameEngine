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

export { StructureActor };

/**
 * @todo
 * 
 * @class StructureActor
 * 
 * Structure-specific actor.
 */
class StructureActor extends Actor {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param ...
     */
    constructor(scene, skeleton) {

        super(scene, {skeleton: skeleton});
    }

    _name;
    _health = 0;
    _armor = 0;
    _masks = [];
    _armors = [];
    _weapons = [];
    _race;
    _team;

}//end class