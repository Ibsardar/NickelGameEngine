////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Steer, Component, Attachable, Smart, Bullet
//  Filename:       SteerComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables steering on SmartBullets.
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

export { SteerComponent };

/**
 * @class SteerComponent
 * 
 * Attachable component that enables
 * steering on SmartBullets.
 */
class SteerComponent extends Attachable {

    /**
     * Static function: attaches steering capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are steering
     */
    static attach(bullet) {

        // add steering (before update)
        SteerComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING)
                SteerComponent._steer(bullet);
        });
    }

    /**
     * Private Static function: adds and applies steering vector.
     * 
     * @param {SmartBullet} bullet bullet that we are steering
     */
    static _steer(bullet) {

        // add steering to current
        var vec = Nickel.v2d.add(
            bullet._steering_vector,
            bullet.sprite.get_velocity()
        );

        // apply
        bullet.sprite.set_velocity(vec);
    }

}//end SteerComponent