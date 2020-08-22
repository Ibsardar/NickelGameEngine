////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Frame, Tween, Skeleton, Action, Animation
//  Filename:       Frame.js
//  Date:           4/22/2020
//  Description:    Class that handles organization of a single tween.
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

export { Frame };

/**
 * @class Frame
 * 
 * Class that handles organization of a single tween.
 */
class Frame {

    /// Default constructor. 
    constructor(start, tween) {

        this.start = start;
        this.end = start + tween._dur_ms;
    }

    /// Should return a value to tween from
    from = (limb) => this.tween._from;

    /// Should return a value to offset tween by
    change = (limb) => this.tween._change;

    /// Tween between the start and end of this frame.
    tween;

    /// Milliseconds after the parent animation's start.
    start = 0;

    /// Duration of the tween + start time
    end = 0;

    /// State of this frame
    /// 'w' : Waiting (Not Yet Started)
    /// 'S' : Started (Currently Animating)
    /// 'C' : Completed (Aimation Is Complete)
    state = 'W';
}