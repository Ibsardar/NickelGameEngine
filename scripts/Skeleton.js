////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Skeleton, Animation
//  Filename:       Skeleton.js
//  Date:           4/15/2020
//  Description:    Class that handles graphics + animations via a Limb Tree.
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

import { Limb } from "./Limb.js";

export { Skeleton };

/**
 * @class Skeleton
 * 
 * Class that handles animations using a Limb Tree.
 * This class also updates and holds all the limbs.
 */
class Skeleton {

    /// Default constructor.
    constructor(root_limb, scene) {

        this._root = root_limb;
        if (!Skeleton._scene)
            Skeleton._scene = scene;
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // update actions that are animating
        for (let k of Object.keys(this._acting)) {
            if (this._acting[k]) {
                this._acting[k]();
                if (this._actions[k]._completed)
                    this._acting[k] = false;
            }
        }

        return this._root.update();
    }

    /**
     * Begins an action (if previously acting, restart)
     * 
     * @param {String} name_of_action 
     */
    act(name_of_action) {

        var action = this._actions[name_of_action];
        action.reset();
        action.start();
        this._acting[name_of_action] = action.update;
    }

    /**
     *  Runs a function on each limb in the skeleton.
     * 
     * @param {function} callback
     */
    each(callback = (limb) => {}) {

        this._root.all(callback);
    }

    /**
     * Returns a copy/clone of self.
     */
    copy() {

        // new Skeleton
        return new Skeleton(this._root.deep_copy(), Skeleton._scene);
    }

    /// alias of copy
    clone = this.copy;

    /**
     * Add named access for a specific limb.
     * 
     * @param {String} name 
     * @param {Limb} limb 
     */
    add_part(name, limb) {

        this._parts[name] = limb;
    }

    /**
     * Access a named limb via its name.
     * 
     * @param {String} name 
     */
    part(name) {

        return this._parts[name];
    }

    /**
     * Root limb of skeleton.
     * 
     * @type {Limb} limb
     */
    get body() { return this._root; }
    set body(l) { this._root = l; }

    /**
     * Child limbs of root of skeleton.
     * 
     * @type {Limb[]} limb array
     */
    get limbs() { return this._root.list(); }

    /**
     * Coordinates of the root's sprite's center.
     * 
     * @type {Number[]} cx, cy coordinates
     */
    get position() { return this._root.sprite.get_center(); }
    set position(p) { this._root.sprite.set_center(p[0], p[1]); }

    /// (Private Static) Viewport of all instances.
    static _scene;

    /// (Private) Dictionary of skeleton actions
    /// Format: 'name of action' : SkeletonAction object
    _actions = {};

    /// (Private) Dictionary of animating skeleton actions
    /// Format: 'name of action' : SkeletonAction object's update function
    _acting = {};

    /// Dict of named limbs.
    /// Format: 'name' => Limb
    _parts = {};

    /// (Private) Root Limb of Limb tree - like the spine of the skeleton
    _root;

    /// id of object
    id = Nickel.UTILITY.assign_id();

}//end class