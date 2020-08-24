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

//junk
import { WeaponMarker } from "../limbs/misc/WeaponMarker.js";

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
        humanoid_sk.set_images(NecronWarrior.data, 'all', true);

        super(GaMa.scene, humanoid_sk, group);

        this.init_body_from_data(NecronWarrior.data);

        var marker = new WeaponMarker();
        this.equip(marker, 'larm');

        var gun = new GaussRifle();
        this.equip(gun, 'rarm');
        gun.sprite.flip_v(true);

        var gun2 = new GaussRifle();
        this.equip(gun2, 'larm');

        this._team = team;
    }
    
    /**
     * Returns body part img data in the format:
     * 'body' : img_data
     * 'larm' : img_data
     * 'rarm' : img_data
     */
    get_data = () => NecronWarrior.data;

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