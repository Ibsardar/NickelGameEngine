////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Seek, Steer, Component, Attachable, Smart, Bullet
//  Filename:       SeekComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables seeking on SmartBullets.
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

export { SeekComponent };

/**
 * @class SeekComponent
 * 
 * Attachable component that enables
 * seeking on SmartBullets.
 */
class SeekComponent extends Attachable {

    /**
     * Static function: attaches seeking capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are seeking
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // create new events for bullet
        bullet._events.seek = [];
        bullet._events.seeked_lost = [];
        bullet._once_events.seek = new Queue();
        bullet._once_events.seeked_lost = new Queue();

        // add vars
        SeekComponent.add_var(bullet._bhv, 'seek', {});
        SeekComponent.add_var(bullet._bhv.seek, 'targets', data.targets);
        SeekComponent.add_var(bullet._bhv.seek, 'radius', data.radius);
        SeekComponent.add_var(bullet._bhv.seek, 'weight', data.weight);
        SeekComponent.add_var(bullet._bhv.seek, 'priority', data.priority);
        SeekComponent.add_var(bullet._bhv.seek, 'last', false);

        // handle optional vars
        if (bullet._bhv.seek.weight == undefined ||
            bullet._bhv.seek.weight == null)
            bullet._bhv.seek.weight = 1;
        // default priority: smallest distance is best target
        if (!bullet._bhv.seek.priority)
            bullet._bhv.seek.priority = function(b, t, d, t_ctr) {
                return d;
            };

        // add properties
        SeekComponent.add_prop(bullet, 'seek_targets',
            function() {return this._bhv.seek.targets;},
            function(tgts) {this._bhv.seek.targets = tgts;}
        );
        SeekComponent.add_prop(bullet, 'seek_radius',
            function() {return this._bhv.seek.radius;},
            function(r) {this._bhv.seek.radius = r;}
        );
        SeekComponent.add_prop(bullet, 'seek_weight',
            function() {return this._bhv.seek.weight;},
            function(w) {this._bhv.seek.weight = w;}
        );

        // add seeking (usually before update)
        SeekComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                SeekComponent._seek(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _seek(bullet) {

        // self's center
        var c = bullet.position;

        // remember the best target
        var best_t = null;
        var best_p = Infinity;

        // check every target
        for (let t of bullet._bhv.seek.targets) {

            // get target's center
            var tc = t;
            if (!Nickel.util.is_arr(t))
                tc = t.get_center();

            // skip if target is not in radius
            var d = Pathfinder.distance_to(c, tc);
            if (d > bullet.seek_radius)
                continue;

            // get highest priority target (lower is better)
            var p = bullet._bhv.seek.priority(bullet, t, d, tc);
            if (p < best_p) {
                best_p = p;
                best_t = t;
            }
        }

        // if target found
        var outcome = false;
        if (best_t) {

            // get seek outcome
            outcome = bullet.sprite.seek3(
                best_t,
                bullet.seek_weight
            );

            // apply seek effect
            bullet._steering_vector = Nickel.v2d.add(
                bullet._steering_vector,
                outcome
            );
        }

        // handle event triggers
        SeekComponent._handle_seek_trigger(bullet, best_t, outcome);

        // remember current target
        bullet._bhv.seek.last = best_t;
    }

    /**
     * @todo docs
     */
    static _handle_seek_trigger(bullet, target, outcome) {

        if (!target && bullet._bhv.seek.last)
            bullet.trigger('seeked_lost', bullet, outcome);
        if (target && !bullet._bhv.seek.last)
            bullet.trigger('seek', bullet, target, outcome);
    }

}//end SeekComponent