////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           10/8/2020
//  Description:    see below...
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

export { SimpleButton };

/**
 * @todo
 * @class SimpleButton
 * 
 * @todo describe
 */
class SimpleButton {

    /// Default constructor.
    constructor(scene, image=null, w=0, h=0, pos=[0,0]) {

        // general
        this.id = Nickel.UTILITY.assign_id();
        this.type = 'SimpleButton';
        this.scene = scene;
        this.canvas = scene.canvas;
        this.context = this.canvas.getContext("2d");

        // image
        this.width = w;
        this.height = h;
        this.image = image;
        
        // position
        this.x = pos[0];
        this.y = pos[1];

        // other
        this.dead = false;
        this.visibility = true;
        this._released = true;
        this._hovering = false;
    }

    //
    // statics
    //

    //...

    //
    // non-statics
    //
    
    this.update = function() {
        //--    Called every frame.
        //--    Updates changing parameters.
        //--

        // skip if marked for deletion
        if (this.dead == true) {
            return;
        }

        // user custom update
        this.update_before();

        // update image
        if (this.image) {
            this.image.x = this.x;
            this.image.y = this.y;
            this.image.width = this.width;
            this.image.height = this.height;
            this.image.update();
        }

        // events
        this.handle_events();

        // user custom update
        this.update_more();
    }

    /// Calculates mouse point based on canvas point
    this.mouse_func = (x,y) => [x,y];

    this.handle_events = function() {
        //--    Handles mouse hover and lmb clicks.
        //--
        
        // mouse hover
        var mpos = this.mouse_func(this.scene.mouse_x, this.scene.mouse_y);
        if (mpos[0] <= this.right &&
            mpos[0] >= this.left &&
            mpos[1] <= this.bottom &&
            mpos[1] >= this.top) {
            if (!this._hovering) {
                this._hovering = true;
                this.on_enter();
            }
            this.on_hover();

            // lmb click
            if (this.scene.mouse_curr === 0) {
                this.on_click();
                this._released = false;
            }

            // lmb release
            if (this.scene.mouse_upped === 0 &&
                     this._released == false) {
                this.on_release();
                this._released = true;
            }
        } else {
            if (this._hovering) {
                this._hovering = false;
                this.on_leave();
            }
        }
    }

    this.destroy = function() {
        //--    Marks current instance for deletion
        //--

        this.dead = true;
        this.visibility = false;
    }

    this.hide = function() {
        //--    Marks current instance's visibility to hidden
        //--

        this.visibility = false;
    }

    this.show = function() {
        //--    Marks current instance's visibility to shown
        //--

        this.visibility = true;
    }

    this.is_visible = function() {
        //--    Returns if self is visible
        //--

        return this.visibility;
    }

    this.update_more = function() {
        //--    Called in update. Meant to be over-ridden.
        //--

    }

    this.update_before = function() {
        //--    Called in update. Meant to be over-ridden.
        //--

    }

    //
    // events
    //

    this.on_hover = function() {
        //--    Called in event handler. Meant to be over-ridden.
        //--

    }

    this.on_enter = function() {
        //--    Called in event handler. Meant to be over-ridden.
        //--

    }

    this.on_leave = function() {
        //--    Called in event handler. Meant to be over-ridden.
        //--

    }

    this.on_click = function() {
        //--    Called in event handler. Meant to be over-ridden.
        //--
        
    }

    this.on_release = function() {
        //--    Called in event handler. Meant to be over-ridden.
        //--
        
    }
    
    //
    // setters
    //

    //
    // properties
    //

    Object.defineProperty(this, "left", {
        get : function () { return this.x; },
        set : function (x) { this.x = x; }
    });

    Object.defineProperty(this, "right", {
        get : function () { return this.x + this.width; },
        set : function (x) { this.x = x - this.width; }
    });

    Object.defineProperty(this, "top", {
        get : function () { return this.y; },
        set : function (y) { this.y = y; }
    });

    Object.defineProperty(this, "bottom", {
        get : function () { return this.y + this.height; },
        set : function (y) { this.y = y - this.height; }
    });

    Object.defineProperty(this, "center", {
        get : function () { return [this.x + this.width / 2, this.y + this.height / 2]; },
        set : function (c) { this.x = c[0] - this.width / 2; this.y = c[1] - this.height / 2 }
    });

}//end SimpleButton