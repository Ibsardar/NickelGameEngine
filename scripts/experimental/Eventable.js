////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Eventable
//  Filename:       Eventable.js
//  Date:           10/3/2020
//  Description:    Abstract class that allows for custom event handling
//                  through keywords.
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

export { Eventable };

/**
 * @class Eventable
 * 
 * Abstract class that allows for custom event handling
 * through keywords.
 */
class Eventable {

    /// Default constructor.
    constructor() {}

    //
    // statics
    //

    /**
     * Adds a new event (if it does not exist) to an instance of Eventable.
     * 
     * @param {Eventable} eventable owner of event
     * @param {String} ev name of event to add
     */
    static add_ev(eventable, ev) {

        if (eventable._events[ev] || eventable._once_events[ev]) {
            console.error('ERROR: Eventable>add_event: the event being added, "' + ev + '", already exists.');
            return;
        } else {
            eventable._events[ev] = [];
            eventable._once_events[ev] = new Queue();
        }
    }

    /**
     * Removes an event.
     * 
     * @param {Eventable} eventable owner of event
     * @param {String} ev name of event to add
     */
    static rem_ev(eventable, ev) {

        delete eventable._events[ev];
        delete eventable._once_events[ev];
    }

    //
    // non-statics
    //
    
    /**
     * Triggers an event with the given arguments.
     * 
     * @param  {String} ev name of event to be triggered
     * @param  {...object} args arguments to be passed into the response function
     */
    trigger(ev, ...args) {

        // trigger all continuous responses for this event
        for (var i in this._events[ev])
            this._events[ev][i](...args);

        // trigger and remove all one-time responses for this event
        while (!this._once_events[ev].is_empty())
            this._once_events[ev].out()(...args);
    }
    
    /**
     * Responds with the given function every time the specified event is
     * triggered.
     * 
     * @param  {String} ev name of event to respond to
     * @param  {Function} func response function
     */
    on(ev, func) {

        // add given function to be triggered on selected event
        this._events[ev].push(func);

        // return index of this function
        return this._events[ev].length - 1;
    }
    
    /**
     * Responds one time with the given function after the specified event
     * is triggered.
     * 
     * @param  {String} ev name of event to respond to
     * @param  {Function} func one-time response function
     */
    once(ev, func) {

        // add given function to be triggered once on selected event
        this._once_events[ev].in(func);
    }

    /**
     * Removes a response that is continuously responding to the specified
     * event by using the given index.
     * 
     * @param  {String} ev name of event to remove from
     * @param  {Number} index index of response in event bus (returned by 'on')
     */
    rem_resp(ev, index) {

        // remove specified response function from continous events
        this._events[ev].splice(index, 1);
    }

    /// (Private) Event, effect-function lists.
    _events = {}

    /// (Private) One-time event, effect-function lists.
    _once_events = {}

}//end Eventable