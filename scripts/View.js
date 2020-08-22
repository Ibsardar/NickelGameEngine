////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       View
//  Filename:       View.js
//  Date:           12/26/2019
//  Description:    Class that manages a view/scene of a game.
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
//  Copyright (c) 2019 Copyright Holder All Rights Reserved.
//
////////////////////////////////////////////////////////////////////////////////

export { View };

/**
 * @class View
 * 
 * Used to create views like main menu, options, pause, etc...
 */
class View {

    /**
     * Default constructor.
     * 
     * @param  {Function} f game init function that will init for this View
     * @param  {Function} f game looping function that will loop for this View
     */
    constructor(i=()=>{}, f=()=>{}) {
        
        this._game_init = i;
        this._game_loop = f;
    }

    /**
     * Static function: Appends a new view from the current view.
     * The previous view can be left paused or unpaused. The 
     * previous vew can be discarded or preserved.
     * Function chaining available.
     * 
     * @param  {View} view the next view to transition to
     * @param  {Boolean} [pause=true] if the previous view should be paused or not
     * @param  {Boolean} [discard_previous=false] if the previous view should be discarded or not
     */
    static next(view, pause=true, discard_previous=false) {

        view._parent = View._current;
        View._current = view;

        if (pause)
            if (view._parent)
                view._parent.paused = true;

        if (discard_previous)
            view._parent = null;

        return view;
    }

    /**
     * Static function: Go back to the previous view. Unpause
     * if paused, if no previous view, warning.
     * Function chaining available.
     * 
     * @param  {View} view the current view to transition from
     */
    static previous(view) {

        if (view._parent) {

            View._current = view._parent;
            View._current.paused = false;

            return View._current;
        } else {

            console.warn('Warning: no previous View exists.');
        }
    }

    /**
     * Static function: Updates the current view.
     */
    static update() {

        if (View._current)
            View._current.update();
        else
            console.warn('Warning: no current View exists.');
    }

    /**
     * Called once during init. Initializes the current view.
     * Used in chain: view.next().init()
     */
    init() {

        // pre-process data for this view
        this._game_init();
    }

    /**
     * Called once per frame. Updates the current view
     * and the parent view.
     */
    update() {

        // only update if this view is not paused
        if (!this.paused) {

            // update previous view first
            if (this._parent)
                this._parent.update();

            // update this view over previous view
            this._game_loop();
        }
    }

    /**
     * Return the previous View from this view.
     * 
     * @returns {View} The parent view of this view 
     */
    previous() {

        return this._parent;
    }

    /**
     * (Chaining function) Send data to a view.
     * Function chaining available.
     * Used in chains: view.next().send(), view.previous().send()
     * 
     * @param {Object[]} args The data to be sent
     * @return {View} the view that we sent data to
     */
    send(...args) {

        this._args = args;
        
        return this;
    }
    
    /**
     * Receive data to from previous view.
     * Receive data is auto-cleared after this operation.
     * 
     * @return {Object[]} The data sent from the previous view
     */
    receive() {

        var args = this._args;
        this._args = [];
        return args;
    }

    /**
     * (Static) The current View being updated.
     * 
     * @type {View} current view
     */
    static get current () { return View._current; }

    /**
     * Game init of View.
     * 
     * @type {Function} game init function that will init for this View
     */
    set game_init (f) { this._game_init = f; }

    /**
     * Game loop of View.
     * 
     * @type {Function} game looping function that will loop for this View
     */
    set game_loop (f) { this._game_loop = f; }

    /// (Private Static) The current (global) view that is being updated onto the Viewport
    static _current = null;
    
    /// (Private) The game init function of a View
    _game_init = () => {}
    
    /// (Private) The game looping function of a View
    _game_loop = () => {}

    /// (Private) The previous View that this View came from
    _parent = null;

    /// (Private) The data sent from the previous view
    _args = [];

    /// (Public) Inidcates wether this View's update function is paused or not
    paused = false;

}//end class