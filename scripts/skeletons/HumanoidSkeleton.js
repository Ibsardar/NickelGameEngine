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
     * *Note:* child limbs are ignored if parent limb is missing.
     * *Note:* if a body part is missing, that limb is disabled.
     * 
     * @param {object} body_part_img_data 
     */
    set_images(body_part_img_data, set_defaults=false) {

        var b = body_part_img_data.body;
        var l = body_part_img_data.larm;
        var r = body_part_img_data.rarm;

        if (b) {

            this.part('body').enable();
            this.part('body').set_sprite(
                Skeleton._scene,
                {img: b.img, w: b.w, h: b.h},
                true, // is collidable?
                true, // is locomotive?
                b.pivot ?? true,
                b.pos ?? [0,0],
                b.rot ?? 0,
                b.siz ?? [1,1]
            );
            if (set_defaults) this.part('body').set_default();
        }
        
        else {

            this.part('body').disable();
            return;
        }

        if (l) {
            
            this.part('larm').enable();
            this.part('larm').set_sprite(
                Skeleton._scene,
                {img: l.img, w: l.w, h: l.h},
                true, // is collidable?
                false, // is locomotive?
                l.pivot ?? true,
                b.larm ?? [0,0],
                l.rot ?? 0,
                l.siz ?? [1,1]
            );
            if (set_defaults) this.part('larm').set_default();
        }

        else {

            this.part('larm').disable();
        }

        if (r) {
            
            this.part('rarm').enable();
            this.part('rarm').set_sprite(
                Skeleton._scene,
                {img: r.img, w: r.w, h: r.h},
                true, // is collidable?
                false, // is locomotive?
                r.pivot ?? true,
                b.rarm ?? [0,0],
                r.rot ?? 0,
                r.siz ?? [1,1]
            );
            if (set_defaults) this.part('rarm').set_default();
        }

        else {

            this.part('rarm').disable();
        }
    }
    
}//end class