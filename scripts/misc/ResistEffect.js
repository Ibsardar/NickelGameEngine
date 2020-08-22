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

export { ResistEffect };

/**
 * @class ResistEffect
 * 
 * ResistEffect stops certain effects from running.
 */
class ResistEffect {

    /// Default constructor.
    constructor(...names_of_effects_to_resist) {
        
        this._effect_names = names_of_effects_to_resist;
    }

    resist(effect) {

        for (var i=0; i<this._effect_names.length; i++)
            if (this._effect_names[i] == effect.name)
                return true;
        return false;
    }

    _effect_names = [];

}//end class