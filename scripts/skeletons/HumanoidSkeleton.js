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

export { HumanoidSkeleton };

/**
 * @class HumanoidSkeleton
 * 
 * Humanoid skeleton:
 * 1 body
 * 2 arms: left, right
 */
class HumanoidSkeleton extends Skeleton {

    /**
     * Default constructor.
     * Scene is expected to already have been set.
     * 
     * @param  {object} data ...
     */
    constructor() {

        // make a skeleton of empty limbs
        super( 
            new Limb(Skeleton._scene).attach(     // body
                new Limb(Skeleton._scene),        // left arm
                new Limb(Skeleton._scene)         // right arm
            )
        );

        // label the limbs
        this.add_part('body', this.body);
        this.add_part('larm', this.body.nth_child(0));
        this.add_part('rarm', this.body.nth_child(1));
    }

    /**
     * Sets a set of image data of the following format:
     * 'body' : img_data
     * 'larm' : img_data
     * 'rarm' : img_data
     * 
     * body_part_name can be any of the following:
     * 'body'
     * 'larm'
     * 'rarm'
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

        // prepare
        var _prepare = (name) => {
            if (body_part_name == name && !body_part_img_data[name])
                return body_part_img_data;
            else
                return body_part_img_data[name];
        }
        var b = _prepare('body');
        var l = _prepare('larm');
        var r = _prepare('rarm');

        // set
        if (body_part_name == 'body' || body_part_name == 'all') {

            if (b) {

                this.part('body').enable();
                this._set_body(b);
                if (set_defaults) this.part('body').set_default();
            } else {

                this.part('body').disable();
                return;
            }
        }
        
        if (body_part_name == 'larm' || body_part_name == 'all') {

            if (l) {
                
                this.part('larm').enable();
                this._set_larm(l);
                if (set_defaults) this.part('larm').set_default();
            } else {

                this.part('larm').disable();
            }
        }
        
        if (body_part_name == 'rarm' || body_part_name == 'all') {
            
            if (r) {
                
                this.part('rarm').enable();
                this._set_rarm(r);
                if (set_defaults) this.part('rarm').set_default();
            } else {

                this.part('rarm').disable();
            }
        }
    }

    /**
     * Sets the sprite of the body limb based on the image data.
     * 
     * @param {object} img_data 
     */
    _set_body(img_data) {

        var b = img_data;
        this.part('body').set_sprite(
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
     * Sets the sprite of the larm limb based on the image data.
     * 
     * @param {object} img_data 
     */
    _set_larm(img_data) {

        var l = img_data;
        var b = this.part('body').img_data;
        this.part('larm').set_sprite(
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
     * Sets the sprite of the rarm limb based on the image data.
     * 
     * @param {object} img_data 
     */
    _set_rarm(img_data) {

        var r = img_data;
        var b = this.part('body').img_data;
        this.part('rarm').set_sprite(
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