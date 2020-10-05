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

        // turn off some overlapping
        this.part('larm').overlap = false;
        this.part('rarm').overlap = false;
        this.part('lfarm').overlap = false;
        this.part('rfarm').overlap = false;
        this.part('lhand').overlap = false;
        this.part('rhand').overlap = false;
        this.part('back').overlap = false;
        this.part('tail').overlap = false;
    }

    /**
     * body_part_img_data expects: {
     *      body    : {...img_data...},
     *      larm    : {...img_data...},
     *      rarm    : {...img_data...},
     *      back    : {...img_data...},
     *      lfarm   : {...img_data...},
     *      rfarm   : {...img_data...},
     *      lhand   : {...img_data...},
     *      rhand   : {...img_data...},
     *      tail    : {...img_data...}
     * }
     * 
     * body_part_name expects any of the following:
     *  - body
     *  - larm
     *  - rarm
     *  - back
     *  - lfarm
     *  - rfarm
     *  - lhand
     *  - rhand
     *  - tail
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
                    back : {
                        jt : 'back', co : false, lo : false,
                        tail : {
                            jt : 'tail', co : false, lo : false,
                        }
                    },
                    larm : {
                        jt : 'larm', co : false, lo : false,
                        lfarm : {
                            jt : 'farm', co : false, lo : false,
                            lhand : {
                                jt : 'hand', co : true, lo : false,
                            }
                        }
                    },
                    rarm : {
                        jt : 'rarm', co : false, lo : false,
                        rfarm : {
                            jt : 'farm', co : false, lo : false,
                            rhand : {
                                jt : 'hand', co : true, lo : false,
                            }
                        }
                    }
                }
            }
        );
    }
}//end class