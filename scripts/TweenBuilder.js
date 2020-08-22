////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Tween, Builder, Animation
//  Filename:       TweenBuilder.js
//  Date:           4/18/2020
//  Description:    Static class that creates various types of tweens.
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

import { Tween } from "./Tween.js";

export { TweenBuilder };

/**
 * @class TweenBuilder
 * 
 * Static class that creates various types of tweens.
 */
class TweenBuilder {

    //  Want:
    //      var my_tween = TweenBuilder.build(
    //          TweenBuilder.interpolation.LINEAR,
    //          TweenBuilder.easing.CUBIC.IN
    //      );
    //      pt_in_between = my_tween.to(start_pt, end_pt, duration_ms, time_ms).get();

    /**
     * Builds a tween object that can tween via the specified
     * interpolation and easing functions.
     * 
     * @param {function} interpolate choose from TweenBuilder.interpolation
     * @param {function} easing choose from TweenBuilder.easing (default NONE)
     */
    static build(interpolate, easing=TweenBuilder.easing.NONE) {

        var tween = new Tween();
        tween.get = () => {

            var tween_vector = [];
            for (var i in tween._from) {
                tween_vector.push(interpolate(
                    tween._now_ms,
                    tween._from[i],
                    tween._change[i],
                    tween._dur_ms,
                    easing
                ));
            }

            return tween_vector;
        }
        tween.apply = () => {

            var tween_vector = [];
            for (var i in tween._from) {
                tween_vector.push(interpolate(
                    tween._now_ms,
                    tween._from[i],
                    tween._change[i],
                    tween._dur_ms,
                    easing
                ));
            }

            for (var i in tween_vector)
                tween._source_objects[i][tween._source_indices[i]] = tween_vector[i];
            
            return tween_vector;
        }
    }

    static interpolation = {

        /**
         * y = m * x + b
         */
        LINEAR : (time, x0, diffx, dur, ease) => {

            return diffx * ease(time / dur) + x0;
        }
    }

    static easing = {

        /**
         * y = x
         */
        NONE : (t) => {

            return t;
        },

        /**
         * y = x ^ 2
         */
        QUADRATIC : {

            IN : (t) => {

                return t * t;
            },

            OUT : (t) => {

                return t * (2 - t);
            },
            
            INOUT : (t) => {

                if (t * 0.5 < 1)
                    return t * t * 0.5;

                return ((1 - t) * (3 - t) + 1) * 0.5;
            }
        },

        /**
         * y = x ^ 3
         */
        CUBIC : {

            IN : (t) => {

                return Math.pow(t, 3);
            },

            OUT : (t) => {

                return Math.pow(t - 1, 3) + 1;
            },
            
            INOUT : (t) => {

                if (t * 0.5 < 1)
                    return Math.pow(t, 3) * 0.5;

                return (Math.pow(t - 2, 3) + 2) * 0.5;
            }
        },

        /**
         * y = x ^ 4
         */
        QUARTIC : {

            IN : (t) => {

                return Math.pow(t, 4);
            },

            OUT : (t) => {

                return 1 - Math.pow(t - 1, 4);
            },
            
            INOUT : (t) => {

                if (t * 0.5 < 1)
                    return Math.pow(t, 4) * 0.5;

                return (2 - Math.pow(t - 2, 4)) * 0.5;
            }
        }
    }

}//end class