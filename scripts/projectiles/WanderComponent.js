////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Wander, Steer, Component, Attachable, Smart, Bullet
//  Filename:       WanderComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables wandering on SmartBullets.
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
//  Copyright (c) 2019 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

import { Attachable } from "../Attachable.js";
import { SmartBullet } from "./SmartBullet.js";

export { WanderComponent };

/**
 * @class WanderComponent
 * 
 * Attachable component that enables
 * wandering on SmartBullets.
 */
class WanderComponent extends Attachable {

    /**
     * Static function: attaches wandering capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are wandering
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // add vars
        WanderComponent.add_var(bullet._bhv, 'wander', {});
        WanderComponent.add_var(bullet._bhv.wander, 'weight', data.weight);
        WanderComponent.add_var(bullet._bhv.wander, 'smooth', data.smooth);
        WanderComponent.add_var(bullet._bhv.wander, 'max', data.max);

        // handle optional vars
        if (bullet._bhv.wander.weight == undefined ||
            bullet._bhv.wander.weight == null)
            bullet._bhv.wander.weight = 1;
        if (bullet._bhv.wander.smooth == undefined ||
            bullet._bhv.wander.smooth == null)
            bullet._bhv.wander.smooth = 50;
        if (bullet._bhv.wander.max == undefined ||
            bullet._bhv.wander.max == null)
            bullet._bhv.wander.max = bullet.get_rot_max();

        // add properties
        WanderComponent.add_prop(bullet, 'wander_weight',
            function() {return this._bhv.wander.weight;},
            function(w) {this._bhv.wander.weight = w;}
        );
        WanderComponent.add_prop(bullet, 'wander_max',
            function() {return this._bhv.wander.max;},
            function(amt) {this._bhv.wander.max = amt;}
        );

        // add wandering (usually before update)
        WanderComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                WanderComponent._wander(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _wander(bullet) {
        
        // get wander vector
        var outcome = bullet.sprite.wander(
            bullet.wander_weight,
            bullet._bhv.wander.smooth,
            false,
            bullet.wander_max
        );

        // apply wander vector
        bullet._steering_vector = Nickel.v2d.add(
            bullet._steering_vector,
            outcome
        );
    }

}//end WanderComponent