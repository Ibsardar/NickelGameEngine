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

export { CanoptekWraithSkeleton };

/**
 * @class CanoptekWraithSkeleton
 * 
 * Canoptek Wraith skeleton:
 * 1 body
 * 2 arms: left, right
 * 2 hands: left, right
 * 2 tools: left, right
 * 6 body claws: x3 left, x3 right
 * 1 back
 * 1 tail
 */
class CanoptekWraithSkeleton extends Skeleton {

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
                new Limb(Skeleton._scene),                 // left tool
                new Limb(Skeleton._scene).attach(          // left arm
                    new Limb(Skeleton._scene)              // left hand
                ),
                new Limb(Skeleton._scene),                 // right tool
                new Limb(Skeleton._scene).attach(          // right arm
                    new Limb(Skeleton._scene)              // right hand
                ),
                new Limb(Skeleton._scene).attach(          // back
                    new Limb(Skeleton._scene),             // tail
                    new Limb(Skeleton._scene),             // left front claw
                    new Limb(Skeleton._scene),             // left middle claw
                    new Limb(Skeleton._scene),             // left rear claw
                    new Limb(Skeleton._scene),             // right front claw
                    new Limb(Skeleton._scene),             // right middle claw
                    new Limb(Skeleton._scene),             // right rear claw
                )
            )
        );

        // label the limbs
        this.add_part('body', this.body);
        this.add_part('ltool', this.body.nth_child(0));
        this.add_part('larm', this.body.nth_child(1));
        this.add_part('rtool', this.body.nth_child(2));
        this.add_part('rarm', this.body.nth_child(3));
        this.add_part('back', this.body.nth_child(4));
        this.add_part('lhand', this.body.nth_child(1).nth_child(0));
        this.add_part('rhand', this.body.nth_child(3).nth_child(0));
        this.add_part('tail', this.body.nth_child(4).nth_child(0));
        this.add_part('lf_claw', this.body.nth_child(4).nth_child(1));
        this.add_part('lm_claw', this.body.nth_child(4).nth_child(2));
        this.add_part('lr_claw', this.body.nth_child(4).nth_child(3));
        this.add_part('rf_claw', this.body.nth_child(4).nth_child(4));
        this.add_part('rm_claw', this.body.nth_child(4).nth_child(5));
        this.add_part('rr_claw', this.body.nth_child(4).nth_child(6));

        // turn off some overlapping
        this.part('ltool').overlap = false;
        this.part('rtool').overlap = false;
        this.part('larm').overlap = false;
        this.part('rarm').overlap = false;
        this.part('back').overlap = false;
        this.part('tail').overlap = false;
    }

    /**
     * body_part_img_data expects: {
     *      body    : {...img_data...},
     *  ... @see CanoptekWraithSkeleton
     * }
     * 
     * body_part_name expects any of the following:
     *  - body
     *  ... @see CanoptekWraithSkeleton
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
                    back : {
                        jt : 'back', co : true, lo : false,
                        tail : {
                            jt : 'tail', co : false, lo : false,
                        },
                        lf_claw : {
                            jt : 'lclaw-1', co : false, lo : false,
                        },
                        lm_claw : {
                            jt : 'lclaw-2', co : false, lo : false,
                        },
                        lr_claw : {
                            jt : 'lclaw-3', co : false, lo : false,
                        },
                        rf_claw : {
                            jt : 'rclaw-1', co : false, lo : false,
                        },
                        rm_claw : {
                            jt : 'rclaw-2', co : false, lo : false,
                        },
                        rr_claw : {
                            jt : 'rclaw-3', co : false, lo : false,
                        }
                    },
                    larm : {
                        jt : 'larm', co : false, lo : false,
                        lhand : {
                            jt : 'hand', co : true, lo : false,
                        }
                    },
                    rarm : {
                        jt : 'rarm', co : false, lo : false,
                        rhand : {
                            jt : 'hand', co : true, lo : false,
                        }
                    },
                    ltool : {
                        jt : 'ltool', co : false, lo : false
                    },
                    rtool : {
                        jt : 'rtool', co : false, lo : false
                    }
                }
            }
        );
    }
}//end class