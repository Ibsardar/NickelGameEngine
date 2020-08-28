////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Collision, EventHandler
//  Filename:       CollisionEventHandler.js
//  Date:           4/17/2020
//  Description:    Static class that handles collision event handling for some
//                  important classes.
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

import { Projectile } from "./projectiles/Projectile.js";
import { ParticleBulletSystem } from "./projectiles/ParticleBulletSystem.js";
import { Limb } from "./Limb.js";
import { Actor } from "./Actor.js";

export { CollisionEventHandler };

/**
 * @class CollisionEventHandler
 * 
 * Static class that handles collision event handling for some
 * important classes.
 */
class CollisionEventHandler {

    /**
     * Handles collision events of various classes.
     * 
     * @param {Function} class_t Class type for determining how to handle events
     * @param {Array[]} targets dictionary of grouped targets
     * @param {QuadTree} trees dictionary of filled-up quadtrees
     * @param {Object[]} collider_struct additional structure holding the sprite
     * @param {Object[]} trigger_struct additional structure holding the triggerable object
     * @param {String} name name of the event that is being triggered
     */
    static handle(class_t, targets, trees, collider_struct=[], trigger_struct=[], name='hit') {

        if (class_t === ParticleBulletSystem)
            CollisionEventHandler._handle_particles(targets, trees, collider_struct, trigger_struct, name);
        else
            CollisionEventHandler._handle_general(targets, trees, collider_struct, trigger_struct, name);
    }

    /**
     * Handles collision events of various classes in the usual way.
     * 
     * Example structs: (default: entity is collider AND triggerable)
     * entity: Actor
     * collider: ['skeleton', '_root'] ===> ...entity['skeleton']['_root']...
     * triggerable: [] ===> ...entity...
     * 
     * @param {Array[]} groups dictionary of grouped targets
     * @param {Array[]} trees dictionary of filled-up quadtrees
     * @param {Object[]} collider_struct additional structure holding the sprite
     * @param {Object[]} trigger_struct additional structure holding the triggerable object
     * @param {String} name name of the event that is being triggered
     */
    static _handle_general(groups, trees, collider_struct, trigger_struct, name) {

        for (var group_name in groups) {
            var targets = groups[group_name];
            for (let target of targets) {

                // (left, top, width, height)
                var bounds;

                // if target is point
                if (Nickel.UTILITY.is_array(target)) {
                    bounds = [target[0], target[1], 1, 1];
                }

                // if target is polygon
                else if (target.type == 'SimplePoly') {
                    bounds = target.get_bounds(2);
                }
                
                // if target is circle
                else if (target.type == 'SimpleCircle') {
                    bounds = target.get_bounds(2);
                }

                // if target is sprite
                else if (target.type == 'Sprite') {
                    // skip if target is destroyed
                    if (target.is_destroyed()) continue;
                    // else get bounds
                    bounds = [target.get_left(),
                              target.get_top(),
                              target.get_w_bound(),
                              target.get_h_bound()];
                }

                // if target is Limb
                else if (target instanceof Limb) {
                    // skip if target is destroyed
                    if (target.sprite.is_destroyed()) continue;
                    // else get bounds
                    bounds = [target.sprite.get_left(),
                              target.sprite.get_top(),
                              target.sprite.get_w_bound(),
                              target.sprite.get_h_bound()];
                }

                // if target is Projectile
                else if (target instanceof Projectile) {
                    // skip if target is destroyed
                    if (target.sprite.is_destroyed()) continue;
                    // else get bounds
                    bounds = [target.sprite.get_left(),
                              target.sprite.get_top(),
                              target.sprite.get_w_bound(),
                              target.sprite.get_h_bound()];
                }

                // if target is Actor (only affects root limb of actor - not the sub-limbs)
                else if (target instanceof Actor) {
                    // skip if target is destroyed
                    if (target.skeleton.body.sprite.is_destroyed()) continue;
                    // else get bounds
                    bounds = [target.skeleton.body.sprite.get_left(),
                              target.skeleton.body.sprite.get_top(),
                              target.skeleton.body.sprite.get_w_bound(),
                              target.skeleton.body.sprite.get_h_bound()];
                }

                // if target is unexpected...
                else {
                    console.error('ERROR: CollisionEventHandler._handle_general> Unexpected target in group:'+group_name);
                    return;
                }

                // get nearby objects
                var objs = trees[group_name].get(
                    [bounds[0], bounds[1]],
                    [bounds[2], bounds[3]]
                );

                // quick function to recursively get a sub-property from an object via a list of accessors
                var get_sub_prop = (struct, o, i=0) => struct[i] ? get_sub_prop(struct, o[struct[i]], ++i) : o[struct[i]] !== undefined ? o[struct[i]] : o;

                // for each nearby object...
                for (let obj of objs) {

                    // ignore if target is same as entity
                    if (obj.entity === target) continue;

                    // ignore limb hitting same actor or self and vice versa
                    var target_actor_id = target instanceof Limb ? target.actor.id :
                        target instanceof Actor ? target.id : false;
                    if (target_actor_id) {
                        var entity_actor_id = obj.entity instanceof Limb ? obj.entity.actor.id :
                                            obj.entity instanceof Actor ? obj.entity.id : false;
                        if (entity_actor_id === target_actor_id) continue;
                    }

                    // get collidable from target
                    var target_collidable = target;
                    if (target instanceof Projectile) target_collidable = target.sprite;
                    if (target instanceof Limb) target_collidable = target.sprite;
                    if (target instanceof Actor) target_collidable = target.skeleton.body.sprite;
                    
                    // get collidable
                    var collidable = get_sub_prop(collider_struct, obj.entity);
                    
                    // trigger event on collided objects
                    if (collidable.colliding_with(target_collidable, false)) {

                        // get triggerable
                        var triggerable = get_sub_prop(trigger_struct, obj.entity);

                        // trigger event
                        triggerable.trigger(name, triggerable, target);
                    }
                }
            }
        }
    }

    /**
     * @todo
     * Handles collision events for particle systems.
     * 
     * Example structs: (default: entity is collider AND triggerable)
     * entity: {sys: ParticleBulletSystem, ptc: Particle}
     * collider: ['ptc'] ===> ...entity['ptc']...
     * triggerable: ['sys'] ===> ...entity['sys']...
     * 
     * @param {Array[]} groups dictionary of grouped targets
     * @param {Array[]} trees dictionary of filled-up quadtrees
     * @param {Object[]} sprite_struct additional structure holding the sprite
     * @param {Object[]} trigger_struct additional structure holding the triggerable object
     * @param {String} name name of the event that is being triggered
     */
    static _handle_particles(groups, trees, collider_struct, trigger_struct, name) {

        //
    }

}//end class