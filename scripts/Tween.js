////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Tween, Animation
//  Filename:       Tween.js
//  Date:           4/18/2020
//  Description:    Class that represents a specific type of tween.
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

export { Tween };

/**
 * @class Tween
 * 
 * Class that represents a specific type of tween.
 */
class Tween {

    //  Want:
    //      var my_tween = TweenBuilder.build(
    //          TweenBuilder.interpolation.LINEAR,
    //          TweenBuilder.easing.CUBIC.IN
    //      );
    //      pt_in_between = my_tween.to(start_pt, end_pt, duration_ms, time_ms).get();
    //      pt_in_between = my_tween.reverse().get()
    //      pt_in_between = my_tween.crop(percent_from_start=0, precent_from_end=0).get()
    //      pt_in_between = my_tween.scale(percent_of_time=100).get()
    //      pt_in_between = my_tween.to(...).reverse().crop(...).scale(...).get()

    /**
     * Calculates tween. (built via TweenBuilder)
     */
    get() {

        return null;
    }

    /**
     * Calculates tween and applies it to sources. (built via TweenBuilder)
     */
    apply() {

        return null;
    }

    /**
     * Resets the tween.
     */
    reset() {

        this._from = [0];
        this._change = [0];
        this._dur_ms = 0;
        this._now_ms = 0;
        this._source_objects = [];
        this._source_indices = [];
    }

    /**
     * Sets tween from some point to another where
     * both points are n-dimensional.
     * 
     * @param {Number[]} start_pt 
     * @param {Number[]} end_pt 
     */
    to(start_pt, end_pt) {

        this._from = start_pt;
        for (var i in this._change) this._change[i] = end_pt[i] - start_pt[i];
        return this;
    }

    /**
     * Sets tween from some point to another which equals point+change
     * amount both start point and change amount are n-dimensional.
     * 
     * @param {Number[]} start_pt
     * @param {Number[]} change_amt
     */
    change(start_pt, change_amt) {

        this._from = start_pt;
        this._change = change_amt;
        return this;
    }

    /**
     * Sets the duration of the tween.
     * 
     * @param {Number} duration_ms
     */
    duration(duration_ms) {

        this._dur_ms = duration_ms;
        return this;
    }

    /**
     * Sets time in-between of desired tween result.
     * 
     * @param {Number} time_inbetween_ms 
     */
    time(time_inbetween_ms) {

        this._now_ms = time_inbetween_ms;
        return this;
    }

    /**
     * Used with apply to automatically tween values.
     * 
     * @param {Object[]} objects source objects containing the indices/keys
     * @param {(String[]|Number[])} indices source indices containing the values to tween
     */
    source(object, index) {

        this._source_objects = object;
        this._source_indices = index;
        return this;
    }

    /**
     * Reverses the tween parameters
     */
    reverse() {

        this._now_ms = this._dur_ms - this._now_ms;
        return this;
    }

    /**
     * Sets crop percentage amount from start of tween
     * and end of tween in terms of ms.
     * 
     * @param {Number} percent_from_start (1=100%)
     * @param {Number} percent_from_end (1=100%)
     */
    crop(percent_from_start=0, percent_from_end=0) {

        for (var i in this._change) {
            
            var c0 = this._change[i] * percent_from_start;
            var c1 = this._change[i] * percent_from_end;

            this._from[i] += c0;
            this._change[i] -= c0 - c1;
        }

        var c0 = this._dur_ms * percent_from_start;
        var c1 = this._dur_ms * percent_from_end;

        this._dur_ms -= c0 - c1;
        this._now_ms -= c0;
        return this;
    }

    /**
     * Sets crop percentage amount from start of tween
     * in terms of ms.
     * 
     * @param {Number} percent_from_start (1=100%)
     */
    crop_start(percent_from_start=0) {

        for (var i in this._change) {
            
            var c0 = this._change[i] * percent_from_start;

            this._from[i] += c0;
            this._change[i] -= c0;
        }

        c0 = this._dur_ms * percent_from_start;

        this._dur_ms -= c0;
        this._now_ms -= c0;
        return this;
    }

    /**
     * Sets crop percentage amount from end of tween
     * in terms of ms.
     * 
     * @param {Number} percent_from_end (1=100%)
     */
    crop_end(percent_from_end=0) {

        for (var i in this._change)
            this._change[i] -= this._change[i] * percent_from_end;

        this._dur_ms -= this._dur_ms * percent_from_end;
        return this;
    }

    /**
     * Sets the scale percent of the tween in terms of ms.
     * 
     * @param {Number} percent_of_time (1=100%)
     */
    scale(percent_of_time=1) {

        this._dur_ms *= percent_of_time;
        this._now_ms *= percent_of_time;
        return this;
    }

    /// (Private) start n-dimensional point
    _from = [0];

    /// (Private) change (end - start) n-dimensional point
    _change = [0];

    /// (Private) duration ms
    _dur_ms = 0;

    /// (Private) time in-between ms
    _now_ms = 0;

    /// (Private) Source objects for use in .apply with _source_indices
    _source_objects = [];

    /// (Private) Source indices for use in .apply with _source_objects
    _source_indices = [];

}//end class