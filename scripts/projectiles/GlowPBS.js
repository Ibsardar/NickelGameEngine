////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Glow, PBS, Particle, Bullet, System
//  Filename:       GlowPBS.js
//  Date:           7/1/2019
//  Description:    Abstract class that describes a particle bullet system with
//                  luminescent light graphics.
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

import { ParticleBulletSystem } from './ParticleBulletSystem.js';

export { GlowPBS }

/**
 * @class GlowPBS
 * 
 * Meant to be used as an abstract class for
 * creating different types of ParticleBulletSystems
 * with particles that have glowing visual effects.
 * * note: utilizes chroma-js library
 * * include in html: https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.0.4/chroma.min.js
 */
class GlowPBS extends ParticleBulletSystem {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param  {object} data data object of system parameters.
     * - > .particle_sys : (required without particle_sys_data) particle system object
     * - > .particle_sys_data : (required without particle_sys) particle system data
     * - > .script_effect : (optional) post update function; called every frame
     * - > .targets : list of collidable targets
     * - > .group : group id of targets and particle systems
     * - > .health : health amount
     * - > .on_create : (optional) particle create event trigger function
     * - > .on_hit : (optional) particle collision event trigger function
     * - > .on_destroyed : (optional) particle destroy event trigger function
     * - > .on_delete : (optional) particle delete event trigger function
     * - > .snd_create : (optional) sound effect on creation
     * - > .snd_hit : (optional) sound effect on target hit
     * - > .snd_destroy : (optional) sound on death
     * 
     * GlowPBS specific params:
     * - > .glow_radius : radius of glow effect
     * - > .glow_color : RGB color of glow
     * - > .glow_intensity : (optional) starting opacity of glow gradient (default = 1)
     * - > .glow_opacity : (optional) opacity of glow effect [0.0 - 1.0] (default = 1)
     * - > .shimmer_period : (optional) period of shimmers in the glow effect [0 period is invalid] (default = 0)
     * - > .shimmer_randomness : (optional) randomness of shimmers (default = 0)
     * - > .shimmer_intensity : (optional) intensity of each shimmer (default = 1)
     * - > .shimmer_speed : (optional) speed of shimmer animation (default = 1)
     */
    constructor(scene, data) {

        // initialize via parent
        super(scene, data);

        // reset waiting on initialization state
        this._state = GlowPBS.WAITING_INIT;

        // handle optional vars
        if (data.glow_opacity == null || data.glow_opacity == undefined)
            data.glow_opacity = 1;
        if (!data.glow_intensity) data.glow_intensity = 1;
        if (!data.shimmer_period) data.shimmer_period = 0;
        if (!data.shimmer_randomness) data.shimmer_randomness = 0;
        if (!data.shimmer_intensity) data.shimmer_intensity = 1;
        if (!data.shimmer_speed) data.shimmer_speed = 1;

        // set shimmer info
        this._shimmer_params = [
            data.shimmer_period,
            data.shimmer_randomness,
            data.shimmer_intensity,
            data.shimmer_speed
        ];

        // create and add glow
        GlowPBS._set_radial_glow(
            this,
            data.glow_radius,
            data.glow_color,
            data.glow_intensity,
            data.glow_opacity
        );

        // enable glow effect on entire system
        this.glow = true;

        // set initialization completed state
        this._state = GlowPBS.INITIALIZED;
    }

    /**
     * Static function: Triggers events based on current state of particles.
     * Must be called at regular intervals (ex: 60 times per second i.e. 60fps).
     */
    static handle_triggers() {

        // handle GlowPBS-specific triggers
        // ...
    }

    /**
     * Private Static function: Adds a radial glow on all particles in
     * the given system.
     * * note: will not overwite previous glow effect, rather adds 
     *   another glow on top of an old glow.
     * * warning: there is no clear way to remove glow effects from
     *   a particle system.
     * 
     * @param {GlowPBS} sys particle system
     * @param {Number} radius radius of glow effect
     * @param {String} color RGB color of glow
     * @param {Number} intensity starting opacity of glow gradient
     * @param {Number} opacity opacity of glow effect (0 to 1)
     */
    static _set_radial_glow(sys, radius, color, intensity, opacity) {

        // calculate hsl once
        var hsl = GlowPBS.hsla(color);

        // add init features
        if (sys._shimmer_params[0]) {
            sys.add_initializer(function(p) {
                p._glow = [radius, hsl, opacity, intensity];
                p._shimmer_timer = new SimpleTimer();
                p._shimmer_vars = [
                    0, // peak - maximum radius
                    0, // end - starting radius
                    0  // stage - animation stage:
                       //           0 = no animation,
                       //           1 = increasing,
                       //           2 = decreasing
                ];
            });
        } else {
            sys.add_initializer(function(p) {
                p._glow = [radius, hsl, opacity, intensity];
            });
        }

        // add continuous features (only shimmer)
        if (sys._shimmer_params[0]) {
            sys.add_updater(function(p) {
                if (sys.glow) {
                    GlowPBS._shimmer(
                        p._shimmer_timer,
                        p._glow,
                        sys._shimmer_params,
                        p._shimmer_vars
                    );
                }
            });
        }

        // add draw features
        sys.add_painter(function(p) {
            if (sys.glow) {

                // draw glow
                var ctx = p.sys.scene.context;   // <--------- THIS IS WRONG, IT IS PRINTING ONTO THE MAIN CANVAS
                //var ctx = p.sys.context;       //            WHEN ACTUALLY IT SHOULD BE PRINTING ONTO THE BUFFER!!!
                ctx.save();                      // <--------- SHOULDN'T NEED THIS IF WE ARE PRINTING TO BUFFER

                ///    RADIAL GRADIENT METHOD
                // NOTE : intensity here equals starting opacity of glow

                // particle properties
                var inner_radius = (p.body == ParticleBuilder.TYPES.ELLIPSE) ?
                    p.size[0] * (p.scale ? p.scale[0] : 1) :
                    Math.min(...p.size) / 2 * (p.scale ? Math.min(...p.scale) : 1);
                var pos = p.get_canvas_pos();
                var hsla_txt = GlowPBS._color_to_css('hsla', p._glow[1]);
                var hsla_0 = hsla_txt.slice(0, -2) + p._glow[3] + ')';
                var hsla_1 = hsla_txt.slice(0, -2) + '0)';
                var outer_radius = p._glow[0] * Math.min(...p.scale);
                if (outer_radius < inner_radius) outer_radius = inner_radius; // correct glow radius

                // stroke properties
                ctx.globalAlpha = p._glow[2];
                var g = ctx.createRadialGradient(
                    ...pos, inner_radius,
                    ...pos, outer_radius
                );
                g.addColorStop(0, hsla_0);
                g.addColorStop(1, hsla_1);
                ctx.fillStyle = g;

                // draw circle
                ctx.beginPath();
                // params: cx, cy, r, ang0, ang1
                ctx.arc(
                    pos[0],
                    pos[1],
                    outer_radius,
                    0,
                    2*Math.PI);
                
                ctx.fill();

                /***
                ///    SHADOW BLUR METHOD --- VERY SLOW
                // NOTE : intensity here equals number of times the glow is painted

                // stroke properties
                ctx.lineWidth = 1;
                ctx.shadowBlur = p._glow[0];
                ctx.shadowColor = GlowPBS._color_to_css('hsl', p._glow[1]);
                ctx.globalAlpha = p._glow[2];
                ctx.strokeStyle = ctx.shadowColor;

                // draw circle
                ctx.beginPath();
                var radius = (p.body == ParticleBuilder.TYPES.ELLIPSE) ?
                    p.size[0] * (p.scale ? p.scale[0] : 1) :
                    Math.min(...p.size) / 2 * (p.scale ? Math.min(...p.scale) : 1);
                var pos = p.get_canvas_pos();
                // (params: cx, cy, radius, start_angle, end_angle, anticlockwise?)
                ctx.arc(
                    pos[0],
                    pos[1],
                    radius,
                    0,
                    2*Math.PI,
                    false);
                for (var i=0; i<p._glow[3]; i++)
                    ctx.stroke();
                ***/
                ctx.restore();                   // <--------- SHOULDN'T NEED THIS IF WE ARE PRINTING TO BUFFER
            }
        });
    }

    /**
     * Private Static function: converts a color array to a css
     * color string.
     * * compatible spaces: rgb, rgba, hsl, hsla
     * 
     * @param {String} space color space
     * @param {Number[]} array color array (3 or 4 length)
     * @returns {String} css string of input color
     */
    static _color_to_css(space, array) {

        var x;
        space[0] == 'h' ? x = [100, '%'] : x = [1, ''];

        if (space[space.length - 1] == 'a')
            return space + '('
                    + (isNaN(array[0]) ? 0 : array[0]) + ','
                    + (array[1] * x[0]) + x[1] + ','
                    + (array[2] * x[0]) + x[1] + ','
                    + array[3] + ')';
        else
            return space + '('
                    + (isNaN(array[0]) ? 0 : array[0]) + ','
                    + (array[1] * x[0]) + x[1] + ','
                    + (array[2] * x[0]) + x[1] + ')';
    }

    /**
     * Private Static function: applies a shimmer animation periodically
     * for some particle.
     * * format of pgv: [radius, hsla color array, opacity, intensity]
     * * format of ssv: [period, randomness, intensity, speed]
     * * format of psv: [peak, start/end(same thing), stage]
     * * warning: ssv and psv are NOT immutable.
     * * format of return code:
     *   > - 1 : timer was just started
     *   > - 2 : shimmer animation is running
     *   > - 3 : waiting for next shimmer animation
     *   > - 4 : new shimmer aniation started
     *   > - 5 : waiting for shimmer animation to complete
     * 
     * @param {SimpleTimer} t shimmer timer
     * @param {Number[]} pgv particle's glow variables
     * @param {Number[]} ssv system's shimmer initializer variables
     * @param {Number[]} psv particle's shimmer animation tracking variables
     * @returns {Number} number code (see above)
     */
    static _shimmer(t, pgv, ssv, psv) {

        // update timer
        t.update();

        // start timer if not started already and finish
        // - offset the next alarm time by a random amount based on rnd
        // - start a new shimmer animation
        // - randomize shimmer radius increase based off rnd
        if (!t.started) {

            var off = ssv[0] * 0.1 * ssv[1];
            t.set_alarm(ssv[0] + Nickel.util.r_num(-off, off));
            t.start();
            off = ssv[2] * 0.1 * ssv[1];
            psv[0] = pgv[0] + ssv[2] + Nickel.util.r_num(-off, off);
            psv[1] = pgv[0];
            psv[2] = 1; // increasing

            return 1;
        }

        // by now, we know timer has started,
        // if alarm has not gone off OR alarm has gone off but animation is still playing:
        // - if a shimmer animation is playing, continue animating it:
        //   - if increasing, increase radius by shimmer speed
        //   - else (decreasing), decrease radius by shimmer speed
        //   - if increasing AND shimmer peak reached, move to decreasing stage
        //   - if shimmer end reached, stop animating and finish
        // - else, do nothing and finish
        if (!t.stopped || (t.stopped && psv[2])) {

            if (psv[2]) {

                if (psv[2] == 1) pgv[0] += ssv[3];
                else pgv[0] -= ssv[3];

                if (psv[2] == 1 && pgv[0] >= psv[0]) psv[2] = 2;
                if (pgv[0] <= psv[1]) psv[2] = 0;

                return 2;

            }
            
            return 3;
        }
        
        // by now, we know the alarm has gone off OR animation is still running,
        // if animation is done:
        // - restart it by shimmer period offsetted by a random amount based off rnd
        // - start a new shimmer animation
        // - randomize shimmer radius increase based off rnd
        if (!psv[2]) {

            var off = ssv[0] * 0.1 * ssv[1];
            t.reset();
            t.set_alarm(ssv[0] + Nickel.util.r_num(-off, off));
            t.start();
            off = ssv[2] * 0.1 * ssv[1];
            psv[0] = pgv[0] + ssv[2] + Nickel.util.r_num(-off, off);
            psv[1] = pgv[0];
            psv[2] = 1; // increasing

            return 4;
        }

        return 5;
    }

    /**
     * Static function: converts a css color string to an hsla array
     * * note: hsla = hue, saturation, luminosity, alpha
     * * return format: [0-360, 0-1, 0-1, 0-1]
     * 
     * @param {String} color any css color string
     * @returns {Number[]} an array of the 4 values of an hsla color
     */
    static hsla(color) {
        return chroma(color).hsl();
    }

    /**
     * Static function: converts a css color string to an rgba array
     * * note: rgba = red, green, blue, alpha
     * * return format: [0-255, 0-255, 0-255, 0-1]
     * 
     * @param {String} color any css color string
     * @returns {Number[]} an array of the 4 values of an rgba color
     */
    static rgba(color) {
        return chroma(color).rgba();
    }

    /**
     * @todo IMPLEMENT CAREFULLY!
     * Returns a copy of this system.
     * 
     * @return {GlowPBS} copy of self
     */
    copy() {

        //...

        return null;
    }

    /**
     * Glow on/off variable for entire system.
     * 
     * @type {Boolean} true/false = on/off 
     */
    get glow() { return this._glow; }
    set glow(bool) { this._glow = bool; }

    /**
     * Shimmer period of all particles.
     * 
     * @type {Number} milliseconds
     */
    get shimmer_period() { return this._shimmer_params[0]; }
    set shimmer_period(p) { this._shimmer_params[0] = p; }

    /**
     * Shimmer randomness of all particles.
     * 
     * @type {Number}
     */
    get shimmer_randomness() { return this._shimmer_params[1]; }
    set shimmer_randomness(r) { this._shimmer_params[1] = r; }

    /**
     * Shimmer intenisty of all particles.
     * (radial change per shimmer)
     * 
     * @type {Number}
     */
    get shimmer_intensity() { return this._shimmer_params[2]; }
    set shimmer_intensity(i) { this._shimmer_params[2] = i; }

    /**
     * Shimmer speed of all particles.
     * (animation speed of shimmer)
     * 
     * @type {Number} milliseconds
     */
    get shimmer_speed() { return this._shimmer_params[3]; }
    set shimmer_speed(s) { this._shimmer_params[3] = s; }

    /// (Private) Glow on/off paramter
    _glow = false;

    /// (Private) Shimmer parameters of all particles in this system
    /// format: period (ms), randomness, intensity (radial diff), speed
    _shimmer_params = [0,0,0,0];

}//end class