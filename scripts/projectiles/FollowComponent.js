////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Follow, Steer, Component, Attachable, Smart, Bullet
//  Filename:       FollowComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables path-following on
//                  SmartBullets.
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

export { FollowComponent };

/**
 * @class FollowComponent
 * 
 * Attachable component that enables
 * path-following on SmartBullets.
 */
class FollowComponent extends Attachable {

    /**
     * Static function: attaches following capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are following
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // create new events for bullet
        bullet._events.arrival = [];
        bullet._events.node_arrival = [];
        bullet._events.final_arrival = [];
        bullet._once_events.arrival = new Queue();
        bullet._once_events.node_arrival = new Queue();
        bullet._once_events.final_arrival = new Queue();

        // add vars
        FollowComponent.add_var(bullet._bhv, 'follow', {});
        FollowComponent.add_var(bullet._bhv.follow, 'path', data.path);
        FollowComponent.add_var(bullet._bhv.follow, 'seek_radius', data.seek_radius);
        FollowComponent.add_var(bullet._bhv.follow, 'arrive_radius', data.arrive_radius);
        FollowComponent.add_var(bullet._bhv.follow, 'weight', data.weight);
        FollowComponent.add_var(bullet._bhv.follow, 'patrol', data.patrol);
        // * note: set to 'true' once path completed *
        FollowComponent.add_var(bullet._bhv.follow, 'curr', 0);

        // add helper function for users
        FollowComponent.add_var(bullet, 'reset_path', function(i=0) {
            bullet._bhv.follow.curr = i;
        })

        // handle optional vars
        if (bullet._bhv.follow.arrive_radius == undefined ||
            bullet._bhv.follow.arrive_radius == null)
            bullet._bhv.follow.arrive_radius = 0;
        if (bullet._bhv.follow.weight == undefined ||
            bullet._bhv.follow.weight == null)
            bullet._bhv.follow.weight = 1;
        if (bullet._bhv.follow.patrol == undefined ||
            bullet._bhv.follow.patrol == null)
            bullet._bhv.follow.patrol = false;

        // add properties
        FollowComponent.add_prop(bullet, 'path',
            function() {return this._bhv.follow.path;},
            function(p) {this._bhv.follow.path = p;}
        );
        FollowComponent.add_prop(bullet, 'path_seek_radius',
            function() {return this._bhv.follow.seek_radius;},
            function(r) {this._bhv.follow.seek_radius = r;}
        );
        FollowComponent.add_prop(bullet, 'path_arrive_radius',
            function() {return this._bhv.follow.arrive_radius;},
            function(r) {this._bhv.follow.arrive_radius = r;}
        );
        FollowComponent.add_prop(bullet, 'follow_weight',
            function() {return this._bhv.follow.weight;},
            function(w) {this._bhv.follow.weight = w;}
        );
        FollowComponent.add_prop(bullet, 'path_patrol',
            function() {return this._bhv.follow.patrol;},
            function(bool) {this._bhv.follow.patrol = bool;}
        );

        // add following (usually before update)
        FollowComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                FollowComponent._follow(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _follow(bullet) {

        // skip if path has been followed
        if (bullet._bhv.follow.curr === true)
            return;
        
        // get follow path outcome
        var outcome = bullet.sprite.follow2(
            bullet.path,
            bullet.path_seek_radius,
            bullet.follow_weight,
            bullet._bhv.follow.curr,
            false,
            (bullet.path_arrive_radius > 0),
            bullet.path_arrive_radius,
            bullet.path_patrol
        );

        // handle follow path events (also updates curr node)
        FollowComponent._handle_path_triggers(bullet, outcome);

        // apply follow path vector
        if (outcome != true) {
            bullet._steering_vector = Nickel.v2d.add(
                bullet._steering_vector,
                outcome[1]
            );
        }
    }

    /**
     * @todo docs
     */
    static _handle_path_triggers(bullet, outcome) {

        if (outcome === true && bullet._bhv.follow.curr !== true) {
            bullet.trigger('final_arrival',
                bullet,
                bullet.path[bullet._bhv.follow.curr], // final target
                bullet._bhv.follow.curr // target index in path list
            );
            bullet.trigger('arrival',
                bullet,
                bullet.path[bullet._bhv.follow.curr], // target
                bullet._bhv.follow.curr // target index in path list
            );
            bullet._bhv.follow.curr = true;

        } else if (outcome[0] != bullet._bhv.follow.curr) {
            bullet.trigger('node_arrival',
                bullet,
                bullet.path[bullet._bhv.follow.curr], // arrived target
                bullet._bhv.follow.curr // target index in path list
            );
            bullet.trigger('arrival',
                bullet,
                bullet.path[bullet._bhv.follow.curr], // target
                bullet._bhv.follow.curr // target index in path list
            );
            bullet._bhv.follow.curr = outcome[0];
        } 
    }

}//end FollowComponent