////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Flee, Steer, Component, Attachable, Smart, Bullet
//  Filename:       FleeComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables fleeing on SmartBullets.
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

export { FleeComponent };

/**
 * @class FleeComponent
 * 
 * Attachable component that enables
 * fleeing on SmartBullets.
 */
class FleeComponent extends Attachable {

    /**
     * Static function: attaches fleeing capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are fleeing
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // create new events for bullet
        bullet._events.flee = [];
        bullet._events.escape = [];
        bullet._once_events.flee = new Queue();
        bullet._once_events.escape = new Queue();

        // add vars
        FleeComponent.add_var(bullet._bhv, 'flee', {});
        FleeComponent.add_var(bullet._bhv.flee, 'targets', data.targets);
        FleeComponent.add_var(bullet._bhv.flee, 'radius', data.radius);
        FleeComponent.add_var(bullet._bhv.flee, 'weight', data.weight);
        FleeComponent.add_var(bullet._bhv.flee, 'priority', data.priority);
        FleeComponent.add_var(bullet._bhv.flee, 'last', false);

        // handle optional vars
        if (bullet._bhv.flee.weight == undefined ||
            bullet._bhv.flee.weight == null)
            bullet.flee_weight = 1;
        // default priority: smallest distance is best target
        if (!bullet._bhv.flee.priority)
            bullet._bhv.flee.priority = function(b, t, d, t_ctr) {
                return d;
            };

        // add properties
        FleeComponent.add_prop(bullet, 'flee_targets',
            function() {return this._bhv.flee.targets;},
            function(tgts) {this._bhv.flee.targets = tgts;}
        );
        FleeComponent.add_prop(bullet, 'flee_radius',
            function() {return this._bhv.flee.radius;},
            function(r) {this._bhv.flee.radius = r;}
        );
        FleeComponent.add_prop(bullet, 'flee_weight',
            function() {return this._bhv.flee.weight;},
            function(w) {this._bhv.flee.weight = w;}
        );

        // add fleeing (usually before update)
        FleeComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                FleeComponent._flee(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _flee(bullet) {
        
        // self's center
        var c = bullet.position;

        // remember the best target
        var best_t = null;
        var best_p = Infinity;

        // check every target
        for (let t of bullet._bhv.flee.targets) {

            // get target's center
            var tc = t;
            if (!Nickel.util.is_arr(t))
                tc = t.get_center();

            // skip if target is not in radius
            var d = Pathfinder.distance_to(c, tc);
            if (d > bullet.flee_radius)
                continue;

            // get highest priority target (lower is better)
            var p = bullet._bhv.flee.priority(bullet, t, d, tc);
            if (p < best_p) {
                best_p = p;
                best_t = t;
            }
        }

        // if target found
        var outcome = false;
        if (best_t) {

            // get flee outcome
            outcome = bullet.sprite.flee3(
                best_t,
                bullet.flee_weight
            );

            // apply flee effect
            bullet._steering_vector = Nickel.v2d.add(
                bullet._steering_vector,
                outcome
            );
        }

        // handle event triggers
        FleeComponent._handle_flee_trigger(bullet, best_t, outcome);

        // remember current target
        bullet._bhv.flee.last = best_t;
    }

    /**
     * @todo docs
     */
    static _handle_flee_trigger(bullet, target, outcome) {

        if (!target && bullet._bhv.flee.last)
            bullet.trigger('escape', bullet, outcome);
        if (target && !bullet._bhv.flee.last)
            bullet.trigger('flee', bullet, target, outcome);
    }

}//end FleeComponent