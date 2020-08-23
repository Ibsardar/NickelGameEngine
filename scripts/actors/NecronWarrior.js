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
import { HumanoidSkeleton } from "../skeletons/HumanoidSkeleton.js";
import { DATA } from "../data_loader2.js";
import { GaussRifle } from "../limbs/weapons/GaussRifle.js";
//import { GuassRifle } from "../weapons/GuassRifle.js";    @todo
//import { LivingMetal } from "../armors/LivingMetal.js";   @todo

export { NecronWarrior };

/**
 * @class NecronWarrior
 * 
 * Necron's basic infantry unit.
 */
class NecronWarrior extends UnitActor {

    /**
     * Default constructor.
     * 
     * @param {String} group 
     * @param {String} team
     */
    constructor(group, team) {

        var humanoid_sk = new HumanoidSkeleton();
        humanoid_sk.set_images(NecronWarrior.data, true);

        super(GaMa.scene, humanoid_sk, group);

        var gun = new GaussRifle();
        this.equip(gun,'rarm');
        this.skeleton.part('rarm').enable();
        this._team = team;
    }

    // stuff unique to necron warriors here...

    /// image data for default body parts.
    static data = {
        body: DATA.IMG.NECRON_BODY_01,
        larm: null,
        rarm: null
    }
    
}//end class

//junk
// Want...
//
//  NecronWarrior.delete_group('t1-dead', false);
//  
//  var necron = new NecronWarrior('t1-living', 't1');
//
//  necron.place_near(pylon);
//
//  necron.defensive();
//  if (pylon.health < 50)
//      necron.defend(pylon);
//
//  var nearby_necrons = necron.get_nearby(NecronWarrior, 't1');
//  if (nearby_necrons.length > 10)
//      var necron_sheild_wall = Formations.sheild_wall(nearby_necrons);
//  
//  necron.hold_item('left', guass_reflector);
//  necron.hold_item('right', guass_rifle);