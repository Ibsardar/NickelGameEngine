////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           4/15/2020
//  Description:    See below...
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

import { Skeleton } from "../Skeleton.js";
import { Limb } from "../Limb.js";

export { WraithSkeleton };

/**
 * @class WraithSkeleton
 * 
 * Wraith skeleton:
 * 1 body
 * 2 arms: left, right
 * 2 forearms: left, right
 * 2 hands: left, right
 * 1 back
 * 1 tail
 */
class WraithSkeleton extends Skeleton {

    /**
     * Default constructor.
     * Scene is expected to already have been set.
     * 
     * @param  {object} data ...
     */
    constructor() {

        // make a skeleton of empty limbs
        super(
            new Limb(Skeleton._scene).attach(              // body
                new Limb(Skeleton._scene).attach(          // left arm
                    new Limb(Skeleton._scene).attach(      // left forearm
                        new Limb(Skeleton._scene)          // left hand
                    )
                ),
                new Limb(Skeleton._scene).attach(          // right arm
                    new Limb(Skeleton._scene).attach(      // right forearm
                        new Limb(Skeleton._scene)          // right hand
                    )
                ),
                new Limb(Skeleton._scene).attach(          // back
                    new Limb(Skeleton._scene)              // tail
                )
            )
        );

        // label the limbs
        this.add_part('body', this.body);
        this.add_part('larm', this.body.nth_child(0));
        this.add_part('rarm', this.body.nth_child(1));
        this.add_part('back', this.body.nth_child(2));
        this.add_part('lfarm', this.body.nth_child(0).nth_child(0));
        this.add_part('rfarm', this.body.nth_child(1).nth_child(0));
        this.add_part('lhand', this.body.nth_child(0).nth_child(0).nth_child(0));
        this.add_part('rhand', this.body.nth_child(1).nth_child(0).nth_child(0));
        this.add_part('tail', this.body.nth_child(2).nth_child(0));
    }

    /**
     * Sets a set of image data of the following format:
     * 'body' : img_data
     * 'larm' : img_data
     * 'rarm' : img_data
     * 'back' : img_data
     * 'lfarm' : img_data
     * 'rfarm' : img_data
     * 'lhand' : img_data
     * 'rhand' : img_data
     * 'tail' : img_data
     * 
     * body_part_name can be any of the following:
     * 'body'
     * 'larm'
     * 'rarm'
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
    set_images(body_part_img_data, body_part_name='all', set_defaults=false) {

        // helpers
        var _prepare = (name) => {
            if (body_part_name == name && !body_part_img_data[name])
                return body_part_img_data;
            else
                return body_part_img_data[name];
        }
        var _set = (name, prepared, func) => {
            if (body_part_name == name || body_part_name == 'all') {
                if (prepared) {
                    this.part(name).enable();
                    func(prepared, this);
                    if (set_defaults) this.part(name).set_default();
                } else {
                    this.part(name).disable();
                    return false;
                }
            }
            return true;
        }

        // prepare
        var b = _prepare('body');
        var l = _prepare('larm');
        var r = _prepare('rarm');
        var lf = _prepare('lfarm');
        var rf = _prepare('rfarm');
        var lh = _prepare('lhand');
        var rh = _prepare('rhand');
        var ba = _prepare('back');
        var ta = _prepare('tail');

        // set
        var gud = true;
        gud = _set('body', b, this._set_body);
        if (!gud) return;
        gud = gud && _set('larm', l, this._set_larm);
        gud = gud && _set('rarm', r, this._set_rarm);
        gud = gud && _set('back', ba, this._set_back);
        if (!gud) return;
        gud = gud && _set('lfarm', lf, this._set_lfarm);
        gud = gud && _set('rfarm', rf, this._set_rfarm);
        gud = gud && _set('tail', ta, this._set_tail);
        if (!gud) return;
        gud = gud && _set('lhand', rh, this._set_lhand);
        gud = gud && _set('rhand', lh, this._set_rhand);
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_body(img_data, ws) {

        var b = img_data;
        ws.part('body').set_sprite(
            Skeleton._scene,
            b,
            true, // is collidable?
            true, // is locomotive?
            b.pivot ?? true,
            b.pos ?? [0,0],
            b.rot ?? 0,
            b.siz ?? [1,1]
        );
    }
    
    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_back(img_data, ws) {

        var ba = img_data;
        var b = ws.part('body').img_data;
        ws.part('back').set_sprite(
            Skeleton._scene,
            ba,
            false, // is collidable?
            false, // is locomotive?
            ba.pivot ?? true,
            b.rarm ?? [0,0],
            ba.rot ?? 0,
            ba.siz ?? [1,1]
        );
    }
    
    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_tail(img_data, ws) {

        var t = img_data;
        var b = ws.part('back').img_data;
        ws.part('tail').set_sprite(
            Skeleton._scene,
            t,
            false, // is collidable?
            false, // is locomotive?
            t.pivot ?? true,
            b.rarm ?? [0,0],
            t.rot ?? 0,
            t.siz ?? [1,1]
        );
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_larm(img_data, ws) {

        var l = img_data;
        var b = ws.part('body').img_data;
        ws.part('larm').set_sprite(
            Skeleton._scene,
            l,
            false, // is collidable?
            false, // is locomotive?
            l.pivot ?? true,
            b.larm ?? [0,0],
            l.rot ?? 0,
            l.siz ?? [1,1]
        );
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_rarm(img_data, ws) {

        var r = img_data;
        var b = ws.part('body').img_data;
        ws.part('rarm').set_sprite(
            Skeleton._scene,
            r,
            false, // is collidable?
            false, // is locomotive?
            r.pivot ?? true,
            b.rarm ?? [0,0],
            r.rot ?? 0,
            r.siz ?? [1,1]
        );
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_lfarm(img_data, ws) {

        var l = img_data;
        var b = ws.part('larm').img_data;
        ws.part('lfarm').set_sprite(
            Skeleton._scene,
            l,
            false, // is collidable?
            false, // is locomotive?
            l.pivot ?? true,
            b.larm ?? [0,0],
            l.rot ?? 0,
            l.siz ?? [1,1]
        );
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_rfarm(img_data, ws) {

        var r = img_data;
        var b = ws.part('rarm').img_data;
        ws.part('rfarm').set_sprite(
            Skeleton._scene,
            r,
            false, // is collidable?
            false, // is locomotive?
            r.pivot ?? true,
            b.rarm ?? [0,0],
            r.rot ?? 0,
            r.siz ?? [1,1]
        );
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_lhand(img_data, ws) {

        var l = img_data;
        var b = ws.part('lfarm').img_data;
        ws.part('lhand').set_sprite(
            Skeleton._scene,
            l,
            true, // is collidable?
            false, // is locomotive?
            l.pivot ?? true,
            b.larm ?? [0,0],
            l.rot ?? 0,
            l.siz ?? [1,1]
        );
    }

    /**
     * Sets the sprite of the specific limb based on the image data.
     * 
     * @param {object} img_data
     * @param {WraithSkeleton} ws
     */
    _set_rhand(img_data, ws) {

        var r = img_data;
        var b = ws.part('rfarm').img_data;
        ws.part('rhand').set_sprite(
            Skeleton._scene,
            r,
            true, // is collidable?
            false, // is locomotive?
            r.pivot ?? true,
            b.rarm ?? [0,0],
            r.rot ?? 0,
            r.siz ?? [1,1]
        );
    }
}//end class