////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Limit, Steer, Component, Attachable, Smart, Bullet
//  Filename:       LimitComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables limiting on SmartBullets.
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

export { LimitComponent };

/**
 * @class LimitComponent
 * 
 * Attachable component that enables
 * limiting on SmartBullets.
 */
class LimitComponent extends Attachable {

    /**
     * Static function: attaches steering capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are steering
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // create new events for bullet
        bullet._events.limiting_min = [];
        bullet._events.limiting_max = [];
        bullet._events.limiting = [];
        bullet._once_events.limiting_min = new Queue();
        bullet._once_events.limiting_max = new Queue();
        bullet._once_events.limiting = new Queue();

        // add vars
        LimitComponent.add_var(bullet._bhv, 'limit', {});
        LimitComponent.add_var(bullet._bhv.limit, 'min', data.min);
        LimitComponent.add_var(bullet._bhv.limit, 'min', data.max);

        // add properties
        LimitComponent.add_prop(bullet, 'min_limit',
            function() {return this._bhv.limit.min;},
            function(min) {this._bhv.limit.min = min;}
        );
        LimitComponent.add_prop(bullet, 'max_limit',
            function() {return this._bhv.limit.min;},
            function(min) {this._bhv.limit.min = min;}
        );

        // add limiting (usually right before update)
        LimitComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                LimitComponent._limit(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _limit(bullet) {

        // handle event triggers (limit effect handled in handlers)
        LimitComponent._handle_maxcapped_trigger(bullet);
        LimitComponent._handle_mincapped_trigger(bullet);
    }

    /**
     * @todo docs
     */
    static _handle_mincapped_trigger(bullet) {

        if (bullet.speed < bullet.min_limit) {
            bullet.trigger('limiting_min', bullet, bullet.speed);
            bullet.trigger('limiting', bullet, bullet.speed);
            bullet.sprite.set_speed(bullet.min_limit);
        }
    }

    /**
     * @todo docs
     */
    static _handle_maxcapped_trigger(bullet) {

        if (bullet.speed > bullet.max_limit) {
            bullet.trigger('limiting_max', bullet, bullet.speed);
            bullet.trigger('limiting', bullet, bullet.speed);
            bullet.sprite.set_speed(bullet.max_limit);
        }
    }

}//end LimitComponent