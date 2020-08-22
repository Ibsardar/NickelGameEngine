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

export { Effect };

/**
 * @class Effect
 * 
 * An effect runs a custom script during combat.
 */
class Effect {

    /// Default constructor.
    constructor(name, script=Effect.default_script) {
        
        this.name = name;
        this.target = target;
        this.script = script;
        this.started_at = Date.now();
    }

    static default_script(weapon_or_hazard_or_effect=null, armor=null, source=null, target=null) {

        // additions to: dmg_normal, dmg_pierce, dmg_break, armor, health
        return [0, 0, 0, 0, 0];
    }

    /**
     * Set type:
     *  'forever' : can fire infinte times (default)
     *  'timed'   : fires within a limited time
     *  'period'  : fires every 'period' milliseconds
     *  'count'   : fires a maximum of 'times' number of times
     * @param {String} type 
     */
    type(type='forever') {

        switch (type) {
            case 'timed':
                this._type = 3;
                break;
            case 'period':
                this._type = 2;
                break;
            case 'count':
                this._type = 1;
                break;
            case 'forever':
            default:
                this._type = 0;
        }
    }

    reset() {

        this.mult = 1;
        this._type = 0;
        this.period = 0;
        delayed = false;
        this.max_times = 1;
        this.times = 0;
        this.max_time = 0;
        this.started_at = Date.now();
        this.last_applied_at = 0;
    }

    resisted(resistors) {

        for (var i=0; i<resistors.length; i++)
            if (resistors[i].resist(this))
                return true;
        return false;
    }

    /**
     * Runs the internal script effect if it has "ticked"/is-available.
     * Returns false if effect has not "ticked" yet or has "expired".
     * 
     * @param {Weapon|Hazard|Effect} weapon_or_hazard_or_effect 
     * @param {Armor} armor 
     * @param {Actor} source 
     * @param {Actor} target 
     * @param {Boolean} force 
     */
    run(weapon_or_hazard_or_effect=null, armor=null, source=null, target=null, force=false) {
        
        // get now in ms
        var now = Date.now();

        // unlimited
        if (this._type == 0 || force) {
            this.times++;
            this.last_applied_at = now;
            return this.script(weapon_or_hazard_or_effect, armor, source, target);
        }
        
        // limited n # of times
        else if (this._type == 1) {
            if (this.times >= this.max_times)
                return false;
            this.times++;
            this.last_applied_at = now;
            return this.script(weapon_or_hazard_or_effect, armor, source, target);
        }

        // periodic with limited time
        else if (this._type == 2) {
            if (this.times == 0 && this.delayed) {
                this.last_applied_at = now; // instigates a delay...
                this.delayed = false; // mark that there is no more delay.
            } if (now - this.started_at >= this.max_time)
                return false;
            if (now <= this.last_applied_at + this.period)
                return false;
            this.last_applied_at = now;
            this.times++;
            return this.script(weapon_or_hazard_or_effect, armor, source, target);
        }

        // limited time only
        else if (this._type == 3) {
            if (now <= this.last_applied_at + this.period)
                return false;
            this.last_applied_at = now;
            this.times++;
            return this.script(weapon_or_hazard_or_effect, armor, source, target);
        }

        // wrong type
        return false;
    }

    name;
    mult = 1;
    _type = 0; // 0=unlimited, 1=limited n # of times, 2=periodic with a limited time, 3=limited time only
    period = 0; // period in milliseconds
    delayed = false; // does the effect fire immediately or does it wait for 1 period?
    max_times = 1;
    times = 0;
    max_time = 0; // max duration in milliseconds
    started_at; // start time in milliseconds
    last_applied_at = 0; // last time applied at in milliseconds
    script; // returns: (additions to) dmg_normal, dmg_pierce, dmg_break, armor, health

}//end class