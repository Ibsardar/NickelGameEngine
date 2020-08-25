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

        // by default, allow root limb of Skeleton to move freely
        this._root.unlock();
    }

    /**
     * @interface
     * 
     * Sets a set of image data of the following format:
     * 'body' : img_data
     * ...
     * 
     * body_part_name can be any of the following:
     * 'body'
     * ...
     * 'all' (applies all of the above) (i.e. unspecified)
     * 
     * If set_defaults is true, also set img_data as default data.
     * 
     * *Note:* child limbs are ignored if parent limb is missing.
     * *Note:* if the specified body part(s) are missing, those limbs are disabled.
     * *Note:* if body_part_name specified AND body_part_name:img_data does not exist,
     *         body_part_img_data will be read as body_part_name.
     * 
     * @param {object} body_part_img_data 
     * @param {strng} body_part_name 
     * @param {boolean} set_defaults 
     */
    set_images(body_part_img_data, body_part_name='all', set_defaults=false) {}

    /**
     * Static helper function for set_images.
     * (Makes creating new skeletons much easier)
     * 
     * mapping expects an n-depth tree: {
     *      limb_name : {
     *          jt : [set this to 'pos' for default behaviour] 'joint-name-in-parent-limb-that-this-limb-attaches-to',
     *          co : is this limb collidable?,
     *          lo : is this limb a locomotive?
     *          (sub) limb_name : {...etc},
     *          (sub) limb_name : {...etc},
     *          (sub) limb_name : {...etc},
     *          ...etc
     *      }
     * }
     * 
     * @param {object} body_part_img_data 
     * @param {string} body_part_name 
     * @param {boolean} set_defaults 
     * @param {Skeleton} skel 
     * @param {object} mapping 
     */
    static _set_images(body_part_img_data, body_part_name, set_defaults, skel, mapping) {

        // helpers
        // Lingo used in helpers:
        // - p : part
        // - pn : part name
        // - pp : parent part
        // - ppn : parent part name
        var _prepare = (pn) => {
            if (body_part_name == pn && !body_part_img_data[pn])
                return body_part_img_data;
            else
                return body_part_img_data[pn];
        }
        var _set = (p, pn, ppn) => {
            if (body_part_name == pn || body_part_name == 'all') {
                var prepared = _prepare(pn);
                if (prepared) {
                    skel.part(pn).enable();
                    var parent = ppn ? skel.part(ppn).img_data : prepared;
                    skel.part(pn).set_sprite(
                        Skeleton._scene,
                        prepared,
                        p.co, // is collidable?
                        p.lo, // is locomotive?
                        prepared.pivot ?? true,
                        parent[p.jt] ?? [0,0],
                        prepared.rot ?? 0,
                        prepared.siz ?? [1,1]
                    );
                    if (set_defaults) skel.part(pn).set_default();
                } else {
                    skel.part(pn).disable();
                    return false;
                }
            }
            return true;
        }
        var _set_all = (pp, ppn=null) => {
            for (var pn in pp) {
                var p = pp[pn];
                if (pn != 'jt' && pn != 'co' && pn != 'lo') {
                    var result = _set(p, pn, ppn);
                    if (result) _set_all(p, pn);
                }
            }
        }
        
        // run with helpers
        _set_all(mapping);
    }

    /**
     * @
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
     * Alias of add_part.
     */
    set_part = this.add_part;

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
     * Returns list of all limbs in skeleton.
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