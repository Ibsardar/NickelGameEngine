////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Boids, sSteer, Component, Attachable, Smart, Bullet
//  Filename:       BoidsComponent.js
//  Date:           6/10/2019
//  Description:    Attachable component that enables BOIDS on SmartBullets.
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

export { BoidsComponent };

/**
 * @class BoidsComponent
 * 
 * Attachable component that enables
 * BOIDS on SmartBullets.
 */
class BoidsComponent extends Attachable {

    /**
     * Static function: attaches boiding capabilities to bullet update.
     * 
     * @param {SmartBullet} bullet bullet that we are boiding
     * @param {object} data behavior details
     */
    static attach(bullet, data) {

        // create new events for bullet
        bullet._events.boids = [];
        bullet._events.boids_align = [];
        bullet._events.boids_in = [];
        bullet._events.boids_out = [];
        bullet._once_events.boids = new Queue();
        bullet._once_events.boids_align = new Queue();
        bullet._once_events.boids_in = new Queue();
        bullet._once_events.boids_out = new Queue();

        // add vars
        BoidsComponent.add_var(bullet._bhv, 'boids', {});
        BoidsComponent.add_var(bullet._bhv.boids, 'targets', data.targets);
        BoidsComponent.add_var(bullet._bhv.boids, 'align_radius', data.align_radius);
        BoidsComponent.add_var(bullet._bhv.boids, 'in_radius', data.cohere_radius);
        BoidsComponent.add_var(bullet._bhv.boids, 'out_radius', data.separate_radius);
        BoidsComponent.add_var(bullet._bhv.boids, 'weight', data.boids_weight);
        BoidsComponent.add_var(bullet._bhv.boids, 'align_weight', data.align_weight);
        BoidsComponent.add_var(bullet._bhv.boids, 'in_weight', data.cohere_weight);
        BoidsComponent.add_var(bullet._bhv.boids, 'out_weight', data.separate_weight);
        

        // handle optional vars
        if (bullet._bhv.boids.weight == undefined ||
            bullet._bhv.boids.weight == null)
            bullet._bhv.boids.weight = 1;
        if (bullet._bhv.boids.align_weight == undefined ||
            bullet._bhv.boids.align_weight == null)
            bullet._bhv.boids.align_weight = 1;
        if (bullet._bhv.boids.in_weight == undefined ||
            bullet._bhv.boids.in_weight == null)
            bullet._bhv.boids.in_weight = 1;
        if (bullet._bhv.boids.out_weight == undefined ||
            bullet._bhv.boids.out_weight == null)
            bullet._bhv.boids.out_weight = 1;

        // add properties
        BoidsComponent.add_prop(bullet, 'boid_targets',
            function() {return this._bhv.boids.targets;},
            function(tgts) {this._bhv.boids.targets = tgts;}
        );
        BoidsComponent.add_prop(bullet, 'align_radius',
            function() {return this._bhv.boids.align_radius;},
            function(r) {this._bhv.boids.align_radius = r;}
        );
        BoidsComponent.add_prop(bullet, 'in_radius',
            function() {return this._bhv.boids.in_radius;},
            function(r) {this._bhv.boids.in_radius = r;}
        );
        BoidsComponent.add_prop(bullet, 'out_radius',
            function() {return this._bhv.boids.out_radius;},
            function(r) {this._bhv.boids.out_radius = r;}
        );
        BoidsComponent.add_prop(bullet, 'boids_weight',
            function() {return this._bhv.boids.weight;},
            function(w) {this._bhv.boids.weight = w;}
        );
        BoidsComponent.add_prop(bullet, 'align_weight',
            function() {return this._bhv.boids.align_weight;},
            function(w) {this._bhv.boids.align_weight = w;}
        );
        BoidsComponent.add_prop(bullet, 'in_weight',
            function() {return this._bhv.boids.in_weight;},
            function(w) {this._bhv.boids.in_weight = w;}
        );
        BoidsComponent.add_prop(bullet, 'out_weight',
            function() {return this._bhv.boids.out_weight;},
            function(w) {this._bhv.boids.out_weight = w;}
        );

        // add boiding (usually before update)
        BoidsComponent.append_func(bullet._attached, function(){
            if (bullet._state == SmartBullet.STEERING) {
                BoidsComponent._boids(bullet);
            }
        });
    }

    /**
     * @todo docs
     */
    static _boids(bullet) {
        
        // get boids vector with component details
        var comps = bullet.sprite.boids(
            bullet.boid_targets,
            bullet.align_radius,
            bullet.in_radius,
            bullet.out_radius,
            bullet._bhv.boids.align_weight,
            bullet._bhv.boids.in_weight,
            bullet._bhv.boids.out_weight,
            bullet._bhv.boids.weight,
            false,
            true
        );
        
        // get final boid vector
        var outcome = comps[0];

        // handle boids events
        BoidsComponent._handle_align_trigger(bullet, comps);
        BoidsComponent._handle_cohere_trigger(bullet, comps);
        BoidsComponent._handle_separate_trigger(bullet, comps);
        BoidsComponent._handle_boids_trigger(bullet, comps);

        // apply boids vector
        bullet._steering_vector = Nickel.v2d.add(
            bullet._steering_vector,
            outcome
        );
    }

    /**
     * @todo docs
     */
    static _handle_boids_trigger(bullet, vec) {

        // only trigger if vector is not the 0-vector
        if (vec[0] || vec[1])
            bullet.trigger('boids', bullet, vec);
    }

    /**
     * @todo docs
     */
    static _handle_align_trigger(bullet, vec) {

        // only trigger if vector is not the 0-vector
        if (vec[0] || vec[1])
            bullet.trigger('boids_align', bullet, vec);
    }
    
    /**
     * @todo docs
     */
    static _handle_cohere_trigger(bullet, vec) {

        // only trigger if vector is not the 0-vector
        if (vec[0] || vec[1])
            bullet.trigger('boids_in', bullet, vec);
    }

    /**
     * @todo docs
     */
    static _handle_separate_trigger(bullet, vec) {

        // only trigger if vector is not the 0-vector
        if (vec[0] || vec[1])
            bullet.trigger('boids_out', bullet, vec);
    }

}//end BoidsComponent