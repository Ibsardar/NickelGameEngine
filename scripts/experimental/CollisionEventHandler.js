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
import { SuperSprite } from "./SuperSprite.js";
import { Eventable } from "./Eventable.js";
import { isinterface } from "../managers/ImplementsManager.js";
import { Spriteable } from "./Spriteable.js";
import { MultiSpriteable } from "./MultiSpriteable.js";
import { Collidable } from "./Collidable.js";
import { ComplexSprite } from "./ComplexSprite.js";

export { CollisionEventHandler };

/**
 * @class CollisionEventHandler
 * 
 * Static class that handles collision event handling for some
 * important classes.
 * 
 * Flow:
 * - references to arrays of items to check => group
 * - grouped references => items from each array reference => QuadTree
 * - subject => QuadTree => items near subject
 * - trigger collisions if needed
 */
class CollisionEventHandler {

    static init(options={}, _default={
        default_qt_max_objs : 4,
        default_qt_max_depth : 4,
        default_qt_bounds : {x:0,y:0,w:0,h:0}
    }) {

        if (options.default_qt_max_objs) CollisionEventHandler._default_max_objs = options.default_qt_max_objs;
        else CollisionEventHandler._default_max_objs = _default.default_qt_max_objs;
        if (options.default_qt_max_depth) CollisionEventHandler._default_max_depth = options.default_qt_max_depth;
        else CollisionEventHandler._default_max_depth = _default.default_qt_max_depth;
        if (options.default_qt_bounds) CollisionEventHandler._default_bounds = options.default_qt_bounds;
        else CollisionEventHandler._default_bounds = _default.default_qt_bounds;
    }

    static set_group_options(group_name, options={}, _default={
        qt_max_objs : 4,
        qt_max_depth : 4,
        qt_bounds : {x:0,y:0,w:0,h:0}
    }) {

        // exception
        if (!CollisionEventHandler._groups[group_name]) {

            console.error('ERROR: CollisionEventHandler>set_group_options: group "'+group_name+'" does not exist.');

        } else {

            CollisionEventHandler._qts[group_name].re_init(
                options.qt_max_objs ? options.qt_max_objs : _default.qt_max_objs,
                options.qt_max_depth ? options.qt_max_depth : _default.qt_max_depth,
                options.bounds ? options.bounds : _default.bounds
            );
        }
    }
 
    static set_group(name, array_refs) {

        // exception
        for (let arr_ref of array_refs) {

            if (!(arr_ref instanceof Array)) {
                
                console.error('ERROR: CollisionEventHandler>set_group: all array references must be instances of Array.');
                return;
            }
        }

        // set
        CollisionEventHandler._groups[name] = [...array_refs];
        CollisionEventHandler._qts[name] = new QuadTree(
            CollisionEventHandler._default_max_objs,
            CollisionEventHandler._default_max_depth,
            CollisionEventHandler._default_bounds
        );
    }

    static unset_group(name) {

        // unset
        delete CollisionEventHandler._groups[name];
        delete CollisionEventHandler._qts[name];
    }

    static add_to_group(name, array_refs) {

        if (CollisionEventHandler._groups[name]) {

            // set
            CollisionEventHandler._groups[name].push(...array_refs);
        } else {

            // exception
            console.error('ERROR: CollisionEventHandler>add_to_group: group "'+name+'" does not exist.');
        }
    }

    static rem_from_group(name, indeces) {

        if (CollisionEventHandler._groups[name]) {

            // remove
            CollisionEventHandler._groups[name].filter((v,i) => !indeces.includes(i));
        } else {

            // exception
            console.error('ERROR: CollisionEventHandler>rem_from_group: group "'+name+'" does not exist.');
        }
    }

    static check(group_name, subject) {

        CollisionEventHandler._fill_qt(
            CollisionEventHandler._qts[group_name],
            CollisionEventHandler._groups[group_name],
            CollisionEventHandler._fill_object_into_qt
        );
        return CollisionEventHandler._trigger_collisions(
            subject,
            CollisionEventHandler._qts[group_name]
        );
    }

    static _fill_qt(qtree, arr_refs, fill = (qt, o) => {}) {

        // begin collision checking by preparing quadtrees:
        // clear & fill all quadtrees with objects within all array refs
        for (let arr_ref of arr_refs) {
            for (let o of arr_ref) {
                fill(qtree, o);
            }
        }
    }

    /**@inprogress (1st draft)*/
    static _fill_object_into_qt(qtree, obj) {

        // identify obj type (what types are allowed into the qtree?)
        // check if obj is valid (based on type)
        // fill the obj into the qtree (based on type)

        // x,y point -> always valid -> 0px rect @ point
        if (Array.isArray(obj)) {
            qtree.in(obj, [obj[0] - 0.5, obj[1] - 0.5], [1,1]);
        }

        /**
         * @todo possibly will need to add separate check for particles/particle systems
         * (making them spriteable/collidable may reduce particle system performance)
         */
        // ParticleBulletSystem -> ?
        // ParticleSystem -> ?
        // Particle -> ?

        // Spriteable+Collidable -> .is_destroyed() -> .get_bounds_for_qt()
        else if (isinterface(Collidable).of(obj) && isinterface(Spriteable).of(obj)) {
            if (!obj.is_destroyed() && obj.is_collidable()) {
                var bnd = obj.get_bounds_for_qt();
                qtree.in(obj, [bnd[0], bnd[1]], [bnd[2], bnd[3]]);
            }
        }
        // ComplexSprite -> Spriteable+Collidable -> ._subject.is_destroyed() -> ._subject.get_bounds_for_qt()
        //               -> MultiSpriteable       -> ._subject.each_spriteable(...)
        else if (obj instanceof ComplexSprite) {
            if (isinterface(Collidable).of(obj._subject) && isinterface(Spriteable).of(obj._subject)) {
                if (!obj.is_destroyed() && obj.is_collidable()) {
                    var bnd = obj._subject.get_bounds_for_qt();
                    qtree.in(obj, [bnd[0], bnd[1]], [bnd[2], bnd[3]]);
                }
            } else if (isinterface(MultiSpriteable).of(obj._subject)) {
                obj._subject.each_spriteable((spriteable) => {
                    /**
                     * @todo add an option to check this only once per MultiSpriteable to increase performance
                     */
                    if (isinterface(Collidable).of(spriteable)) {
                        if (!spriteable.is_destroyed() && spriteable.is_collidable()) {
                            var bnd = spriteable.get_bounds_for_qt();
                            qtree.in(spriteable, [bnd[0], bnd[1]], [bnd[2], bnd[3]]);
                        }
                    }
                });
            }
        }
        // Circle -> always valid -> .get_bounds(2)
        else if (obj instanceof SimpleCircle) {
            var bnd = obj.get_bnd(2);
            qtree.in(obj, [bnd[0],bnd[1]], [bnd[2],bnd[3]]);
        }
        // Polygon -> always valid -> .get_bounds(2)
        else if (obj instanceof SimplePoly) {
            var bnd = obj.get_bnd(2);
            qtree.in(obj, [bnd[0],bnd[1]], [bnd[2],bnd[3]]);
        }
        // Unknown -> error
        else {
            console.error('ERROR: CollisionEventHandler._fill_object_into_qt> Unexpected object type.');
        }
    }

    /**@completed (1st draft)*/ 
    static _trigger_collisions(obj, qtree) {

        // ...now we know what Spriteable and MultiSpriteable must be defined like... so do it!
        // HERE! - FIX THIS FUNCTION (i.e. redo it but go by general idea of the below code)

        // get Spriteable/MultiSpriteable
        var subject;
        if (obj instanceof ComplexSprite)
            subject = obj._subject;
        else if (isinterface(Collidable).of(obj) && isinterface(Spriteable).of(Spriteable))
            subject = obj;
        else {
            console.error('ERROR: CollisionEventHandler._trigger_collisions> Unexpected object type.');
            return false;
        }

        // 2 types: single spriteable OR multi spriteable
        // 'hit' event: (
        //      item-being-triggered,
        //      colliding-entity,
        //      (if multisprite) child-item-that-caused-collision from item-being-triggered (otherwise null)),
        //      (if multisprite) child-item-that-caused-collision from colliding-entity (otherwise null))
        var hit = false;
        if (isinterface(Spriteable).of(subject)) {

            if (subject.is_destroyed()) return false;
            if (!isinterface(Collidable).of(subject)) return false;
            if (!subject.is_collidable()) return false;
            var nearby = qtree.get(subject.get_bounds_for_qt());
            for (let o of nearby) {
                var target = o.entity;

                if (subject.same_as(target)) continue;
                if (subject.colliding_with(target)) {

                    if (obj instanceof Eventable)
                        obj.trigger('hit', obj, target);
                    if (target instanceof Eventable)
                        target.trigger('hit', target, obj);
                    hit = true;

                }

            }

        } else if (isinterface(MultiSpriteable).of(subject)) {

            if (subject.is_destroyed()) return false;
            subject.each_spriteable((spriteable_child) => {

                if (spriteable_child.is_destroyed()) return false;
                if (!isinterface(Collidable).of(spriteable_child)) return false;
                if (!spriteable_child.is_collidable()) return false;
                var nearby = qtree.get(spriteable_child.get_bounds_for_qt())
                for (let o of nearby) {
                    var target = o.entity;

                    if (subject.same_as(target)) continue;
                    if (spriteable_child.same_as(target)) continue;
                    if (spriteable_child.colliding_with(target)) {

                        if (obj instanceof Eventable)
                            obj.trigger('hit', obj, target, spriteable_child);
                        if (target instanceof Eventable)
                            target.trigger('hit', target, obj, null, spriteable_child);
                        hit = true;

                    }

                }

            });

        } else {
            console.error('ERROR: CollisionEventHandler._trigger_collisions> Unexpected subject type.');
        }

        return hit;
    }

    // stored quadtrees by group keys
    static _qts = {};

    // lists of references of arrays of items by group keys
    static _groups = {};

    // quadtree options
    static _default_max_objs = 4;
    static _default_max_depth = 4;
    static _default_bounds = {x:0,y:0,w:0,h:0};

}//end class