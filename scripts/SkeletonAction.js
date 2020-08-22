////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Skeleton, Action, Animation
//  Filename:       SkeletonAction.js
//  Date:           4/21/2020
//  Description:    Class that handles a single animation via a Skeleton.
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

export { SkeletonAction };

/**
 * @class SkeletonAction
 * 
 * Class that handles a single animation using a Skeleton.
 */
class SkeletonAction {

    /// Default constructor. 
    constructor(skeleton) {

        this._skeleton = skeleton;
    }

    /**
     * Static helper function: trims extra time before the
     * start of the first frame. Also will adjust negative
     * outlier frames to fit into the animation.
     * 
     * @param {SkeletonAction} action 
     */
    static trim_start(action) {

        var min = 99999999999;
        for (let f of action._frames)
            if (f.start < min)
                min = f.start;

        if (!min) return;
        
        for (let f of action._frames) {
            f.start -= min;
            f.end -= min;
        }
        action._duration -= min;
    }

    /**
     * Static helper function: trims extra time after the
     * end of the last frame. Also will adjust positive
     * outlier frames to fit into the animation.
     * 
     * @param {SkeletonAction} action 
     */
    static trim_end(action) {

        var max = 0;
        for (let f of action._frames)
            if (f.end > max)
                max = f.end;
        
        action._duration = max;
    }

    /**
     * Static helper function: trims extra time before the
     * start of the first frame and after the end of the
     * last frame.
     * 
     * @param {SkeletonAction} action 
     */
    static trim(action) {

        SkeletonAction.trim_start(action);
        SkeletonAction.trim_end(action);
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // update time
        this._elapsed = Date.now() - this._start;

        // update triggers
        if (!this._completed && this._elapsed >= this._duration) {
            this._completed = true;
            var actor = this._skeleton.actor;
            var self = this;
            actor._action_complete_trigger_queue.in(() => {
                this.trigger('action-complete', actor, self);
            });
        }

        // update frames
        for (let f of this._frames) {
            if (f.state == 'W' && f.start >= this._elapsed)
                f.state = 'S';
            if (f.state == 'S') {
                if (f.end > this._elapsed)
                    this.apply_tween(f);
                else
                    f.state = 'C';
            }
            
        }
    }

    /**
     * Applies the tween to the skeleton's Limbs.
     * 
     * @param {Frame} frame 
     */
    apply_tween(frame) {

        frame.tween
            .time(this._elapsed)
            .change(frame.from(), frame.change())
            .apply();
    }

    /**
     * Starts the animation timer.
     */
    start() {
        
        this._start = Date.now();
    }

    /**
     * Forces the animation to halt.
     */
    complete() {
        
        this._completed = true;
    }

    /**
     * Resets the animation to zero.
     */
    reset() {
        
        this._completed = false;
        this._start = 0;
        this._elapsed = 0;
    }

    /// Name of this action (given by Skeleton)
    name;

    /// Skeleton object of this action
    _skeleton;

    /// List of Frames
    _frames = [];

    /// Action completion flag
    _completed = false;

    /// Start time of action (global)
    _start = 0;

    /// Elapsed time since action start
    _elapsed = 0;

    /// Total duration of action
    _duration = 0;
}