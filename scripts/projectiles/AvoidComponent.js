////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Avoid, Steer, Component, Attachable, Smart, Bullet
//  Filename:       AvoidComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables avoidance on SmartBullets.
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

export { AvoidComponent };

/**
 * @class AvoidComponent
 * 
 * Attachable component that enables
 * avoidance on SmartBullets.
 */
class AvoidComponent extends Attachable {

    /**
     * Static function: attaches avoiding capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are avoiding
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // create new events for bullet
        bullet._events.avoid = [];
        bullet._once_events.avoid = new Queue();

        // add vars
        AvoidComponent.add_var(bullet._bhv, 'avoid', {});
        AvoidComponent.add_var(bullet._bhv.avoid, 'targets', data.targets);
        AvoidComponent.add_var(bullet._bhv.avoid, 'radius', data.radius);
        AvoidComponent.add_var(bullet._bhv.avoid, 'weight', data.weight);
        AvoidComponent.add_var(bullet._bhv.avoid, 'sight', data.sight);

        // handle optional vars
        if (bullet._bhv.avoid.weight == undefined ||
            bullet._bhv.avoid.weight == null)
            bullet._bhv.avoid.weight = 1;
        if (bullet._bhv.avoid.sight == undefined ||
            bullet._bhv.avoid.sight == null)
            bullet._bhv.avoid.sight = 10;

        // add properties
        AvoidComponent.add_prop(bullet, 'avoid_targets',
            function() {return this._bhv.avoid.targets;},
            function(tgts) {this._bhv.avoid.targets = tgts;}
        );
        AvoidComponent.add_prop(bullet, 'avoid_radius',
            function() {return this._bhv.avoid.radius;},
            function(r) {this._bhv.avoid.radius = r;}
        );
        AvoidComponent.add_prop(bullet, 'avoid_weight',
            function() {return this._bhv.avoid.weight;},
            function(w) {this._bhv.avoid.weight = w;}
        );

        // add avoiding (usually before update)
        AvoidComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                AvoidComponent._avoid(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _avoid(bullet) {
        
        // get avoid outcome
        var outcome = bullet.sprite.avoid_obstacles(
            bullet.avoid_targets,
            bullet.avoid_radius,
            bullet._bhv.avoid.sight,
            0,
            true,
            bullet.avoid_weight
        );

        // handle avoid events
        AvoidComponent._handle_avoid_trigger(bullet, outcome);

        // apply avoid vector if avoidance occurred
        if (outcome[0] == 2) {
            bullet._steering_vector = Nickel.v2d.add(
                bullet._steering_vector,
                outcome[4]
            );
        }
    }

    /**
     * @todo docs
     */
    static _handle_avoid_trigger(bullet, outcome) {

        // trigger if avoidance occurred
        if (outcome[0] == 2)
            bullet.trigger('avoid',
                bullet,
                outcome[5],     // target that was avoided
                outcome[1],     // sight in the form of a LineSegment
                outcome[2],     // the SimpleCircle surrounding the avoided target
                outcome[3][3]   // list of intersection points on the SimpleCircle
            );
    }

}//end AvoidComponent