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
     * body_part_img_data expects: {
     *      body    : {...img_data...},
     *      larm    : {...img_data...},
     *      rarm    : {...img_data...}
     * }
     * 
     * body_part_name expects any of the following:
     *  - body
     *  - larm
     *  - rarm
     *  - all
     * 
     * @see Skeleton.set_images for more details.
     */
    set_images(body_part_img_data, body_part_name='all', set_defaults=false) {

        // set all images for each part correctly
        // Lingo:
        // - jt : joint name in parent that self attaches to (FOR DEFAULT BEHAVIOR, LEAVE IT AS "pos"!)
        // - co : is collidable?
        // - lo : is locomotive?
        Skeleton._set_images(
            body_part_img_data,
            body_part_name,
            set_defaults,
            this,
            {
                body : {
                    jt : 'pos', co : true, lo : true,
                    larm : {
                        jt : 'larm', co : true, lo : false,
                    },
                    rarm : {
                        jt : 'rarm', co : true, lo : false,
                    }
                }
            }
        );
    }
}//end class