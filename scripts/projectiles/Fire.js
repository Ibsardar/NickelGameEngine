////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Fire, Glow, PBS, Particle, Bullet, System
//  Filename:       Fire.js
//  Date:           7/13/2019
//  Description:    Class that describes collidable fire with light effects.
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

import { GlowPBS } from './GlowPBS.js';

export { Fire }

/**
 * @class Fire
 * 
 * Meant to be used as collidable fire with light effects.
 * Utilizes a glowing particle bullet system.
 * * note: utilizes chroma-js library
 * * include in html: https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.0.4/chroma.min.js
 */
class Fire extends GlowPBS {

    /**
     * Default constructor.
     * * warning: requires particle system to have translation enabled.
     * * warning: changes particle system's color space to HSLA.
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
     * - > .glow_radius : radius of glow effect (will be overwritten)
     * - > .glow_color : RGB color of glow (will be overwritten)
     * - > .glow_intensity : (optional) starting opacity of glow gradient (default = 1) (will be overwritten)
     * - > .glow_opacity : (optional) opacity of glow effect [0.0 - 1.0] (default = 1) (will be overwritten)
     * - > .shimmer_period : (optional) period of shimmers in the glow effect [0 period is invalid] (default = 0)
     * - > .shimmer_randomness : (optional) randomness of shimmers (default = 0)
     * - > .shimmer_intensity : (optional) intensity of each shimmer (default = 1)
     * - > .shimmer_speed : (optional) speed of shimmer animation (default = 1)
     * 
     * Fire specific params:
     * - > .emission_points : array of points to emit fire from (randomly picked each frame)
     * - > .colors : (optional) array of color steps in the color gradient of the fire (default = ['red','red','orange','yellow','lightyellow'])
     * - > .turbulence : (optional) turbulence properties; each represents a bound of randomness:
     *   > - p0x : initial x position turbulence (default=[-15,15])
     *   > - p0y : initial y position turbulence (default=[-15,15])
     *   > - v0x : initial x velocity turbulence
     *   > - v0y : initial y velocity turbulence
     *   > - vx : x velocity turbulence
     *   > - vy : y velocity turbulence
     *   > - ax : x force (i.e. acceleration) turbulence
     *   > - ay : y force (i.e. acceleration) turbulence
     *   > - siz : scale turbulence
     *   > - glo : glow radius turbulence
     *   > - clr : color scale gradient turbulence
     *   > - hue : hsl-color's hue turbulence
     *   > - lum : hsl-color's luminence turbulence
     *   > - bri : hsl-color's brightness turbulence
     * - > .inital_velocity : (optional) initial velocity of each particle (default=[0,0])
     * - > .force : (optional) continuous force applied on each particle (default=[0,0])
     * - > .jerk : (optional) initial jerk applied to net force of particle (default=[0,-0.1])
     * - > .temperature_calculation_method : (optional) temperature calculation method (default=TEMP_DOWN_FROM_LIFETIME)
     * - > .temperature_calculation_max : (optional) temperature calculation max parameter (default=3000 i.e. 3 seconds)
     * - > .scale_limits : (optional) max and min of particle scaling (default=[1,1])
     * - > .radius_limits : (optional) max and min of glow radius (default=[4,32])
     * - > .death_condition : (optional) death condition (default=ON_COLD)
     */
    constructor(scene, data) {

        // initialize via parent
        super(scene, data);

        // reset waiting on initialization state
        this._state = Fire.WAITING_INIT;

        // set color space of particles to HSLA
        this._ps.set_color_space('hsla');
        
        // set emitter points
        this._fire_emit_pts = data.emission_points;

        // handle default values
        // turbulence
        this._fire_turbulence.p0x = [-15,15];
        this._fire_turbulence.p0y = [-15,15];
        // initial velocity
        this._fire_init_vel = [0,0];
        // force
        this._fire_force = [0,0];
        /// jerk
        this._fire_jerk = [0,-0.1];
        // temperature calculation method
        this._fire_tcalc_method = Fire.TEMP_DOWN_FROM_LIFETIME;
        // temperature calculation maximum
        this._fire_tcalc_max = 3000; // 3 seconds
        // scale min/max limits
        this._fire_scale_lims = [1,1];
        // radius min/max limits
        this._fire_radius_lims = [4,32];
        // death condition
        this._fire_cnd_death = Fire.ON_COLD;

        // handle optional vars
        // color
        if (data.colors) this.colors = data.colors;
        else this.colors = ['red', 'red', 'orange', 'yellow', 'lightyellow'];
        // turbulence
        if (data.turbulence) this._fire_turbulence = data.turbulence;
        // initial velocity
        if (data.inital_velocity) this._fire_init_vel = data.inital_velocity;
        // force
        if (data.force) this._fire_force = data.force;
        /// jerk
        if (data.jerk) this._fire_jerk = data.jerk;
        // temperature calculation method
        if (data.temperature_calculation_method) this._fire_tcalc_method = data.temperature_calculation_method;
        // temperature calculation maximum
        if (data.temperature_calculation_max) this._fire_tcalc_max = data.temperature_calculation_max;
        // scale min/max limits
        if (data.scale_limits) this._fire_scale_lims = data.scale_limits;
        // radius min/max limits
        if (data.radius_limits) this._fire_radius_lims = data.radius_limits;
        // death condition
        if (data.death_condition) this._fire_cnd_death = data.death_condition;

        // add init function
        var self = this;
        this.add_initializer(function(p) {

            // always get a random emission point
            var rnd_emit_pt = Nickel.v2d.copy(Nickel.util.r_elem(self._fire_emit_pts));

            // apply turbulence to initial velocity
            var ivel = Nickel.v2d.copy(self._fire_init_vel);
            if (self._fire_turbulence.v0x)
                ivel[0] += self._get_turbulence('v0x', 5);
            if (self._fire_turbulence.v0y)
                ivel[1] += self._get_turbulence('v0y', 5);

            // set fire parameters
            p._fire = [
                ivel,               // 0. velocity
                1,                  // 1. temperature
                rnd_emit_pt         // 2. particle's originating emission point
            ];

            // apply turbulence to initial position
            var pt = Nickel.v2d.copy(rnd_emit_pt);
            if (self._fire_turbulence.p0x)
                pt[0] += self._get_turbulence('p0x', 2);
            if (self._fire_turbulence.p0y)
                pt[1] += self._get_turbulence('p0y', 2);

            // set randomized position
            p.set_canvas_pos(pt);
        });

        // add update function
        this.add_updater(function(p){

            // check (and maybe apply) death condition
            if (self._fire_cnd_death(self, p)) {
                p.dead = true;
                return;
            }

            // apply position turbulence
            // apply turbulence to force / acceleration (directly to vel to avoid changing set accel/force)
            if (self._fire_turbulence.ax)
                p._fire[0][0] += self._get_turbulence('ax', 5);
            if (self._fire_turbulence.ay)
                p._fire[0][1] += self._get_turbulence('ay', 5);
            // apply turbulence to velocity (directly to pos to avoid changing set velocity)
            if (self._fire_turbulence.vx)
                p.pos[0] += self._get_turbulence('vx', 5);
            if (self._fire_turbulence.vy)
                p.pos[1] += self._get_turbulence('vy', 5);

            // apply position changes
            // jerk -> force / accel
            self._fire_force = Nickel.v2d.add(self._fire_force, self._fire_jerk);
            self._fire_jerk = [0,0]; // reset since jerk is not continuous

            // force / accel -> velocity
            p._fire[0] = Nickel.v2d.add(p._fire[0], self._fire_force); // since force is continuous

            // velocity -> position
            p.pos = Nickel.v2d.add(p.pos, p._fire[0]);

            // apply temperature changes
            // temp based off of lifetime/dist from (emitted-from/closest) emission point
            // default : based off of lifetime
            // between 0 and 1 (0% - 100%)
            p._fire[1] = self._fire_tcalc_method(self, p, self._fire_tcalc_max);

            // apply scale changes
            // based off of temperature
            // temperature -> scale
            if (p.scale) {
                var s = Fire._rescale(p._fire[1], [0,1], self._fire_scale_lims);

                // apply turbulence to scale
                if (self._fire_turbulence.siz)
                    s += self._get_turbulence('siz', 5);

                p.scale = [s,s];
            }

            // apply opacity changes
            // based off of temperature
            if (p.opacity != null && p.opacity != undefined)
                p.opacity = p._fire[1];

            // apply glow effect changes
            // based off of temperature
            if (self.glow) {

                // glow radius
                p._glow[0] = Fire._rescale(p._fire[1], [0,1], self._fire_radius_lims);

                // apply turbulence to glow radius
                if (self._fire_turbulence.glo)
                    p._glow[0] += self._get_turbulence('glo', 5);

                // glow opacity
                p._glow[2] = (p.opacity != null && p.opacity != undefined) ? p.opacity : 1;
            }

            // get turbulence for color scale
            var clr_t = 0;
            if (self._fire_turbulence.clr)
                clr_t = self._get_turbulence('clr', 5);

            // apply color changes
            // based off of temperature
            // temperature -> color
            var hsla = self._clr_scale(p._fire[1] + clr_t).hsl();

            // apply turbulence for hsl color
            if (self._fire_turbulence.hue)
                hsla[0] += self._get_turbulence('hue', 2);
            if (self._fire_turbulence.lum)
                hsla[1] += self._get_turbulence('lum', 5);
            if (self._fire_turbulence.bri)
                hsla[2] += self._get_turbulence('bri', 5);

            if (p.fill) p.fill = hsla;
            if (p.color) p.color = [...hsla];
            if (self.glow) p._glow[1] = [...hsla];

        });

        // set initialization completed state
        this._state = Fire.INITIALIZED;
    }

    /**
     * Rescales a number from its current limits to
     * another set of limits i.e. normalization.
     * 
     * @param {Number} a number to rescale
     * @param {Number[]} a_lims array containing current min and max limits, respectively
     * @param {Number[]} b_lims array containing rescale min and max limits, respectively
     * @returns {Number} input 'a' normalized to new limits 'b_lims'
     */
    static _rescale(a, a_lims, b_lims) {

        // get ranges from limits
        var range_a = a_lims[1] - a_lims[0];
        var range_b = b_lims[1] - b_lims[0];

        // rescale to [0, 1] limits
        var b = (a - a_lims[0]) / range_a;

        // rescale to new limits
        b = (b * range_b) + b_lims[0];

        // return a normalized to b's limits
        return b;
    }

    /**
     * Get randomized additive for a certain parameter.
     * 
     * @param {String} param matches one of the turbulence properties
     * @param {Number} decimals number of decimals spaces for randomization
     * @returns {Number} cooresponding turbulance additive
     */
    _get_turbulence(param, decimals=0) {

        var decs = Math.pow(10, decimals);
        
        return Nickel.util.r_num(
            this._fire_turbulence[param][0] * decs,
            this._fire_turbulence[param][1] * decs
        ) / decs;
    }

    /**
     * Color gradient scale for fire using rgb interpolation.
     * 
     * @type {String[]} array of css colors
     */
    set colors(arr) { this._clr_scale = chroma.scale(arr).mode('rgb'); }

    /**
     * Color gradient scale for fire using rgb interpolation.
     * 
     * @type {String[]} array of css colors
     */
    set colors_rgb(arr) { this._clr_scale = chroma.scale(arr).mode('rgb'); }

    /**
     * Color gradient scale for fire using lrgb interpolation.
     * 
     * @type {String[]} array of css colors
     */
    set colors_lrgb(arr) { this._clr_scale = chroma.scale(arr).mode('lrgb'); }

    /**
     * Color gradient scale for fire using lch interpolation.
     * 
     * @type {String[]} array of css colors
     */
    set colors_lch(arr) { this._clr_scale = chroma.scale(arr).mode('lch'); }

    /**
     * Color gradient scale for fire using hsl interpolation.
     * 
     * @type {String[]} array of css colors
     */
    set colors_hsl(arr) { this._clr_scale = chroma.scale(arr).mode('hsl'); }

    /**
     * Color gradient scale for fire using lab interpolation.
     * 
     * @type {String[]} array of css colors
     */
    set colors_lab(arr) { this._clr_scale = chroma.scale(arr).mode('lab'); }

    /// (Static Constant) Pre-made condition/temperature calc callbacks.
    static get TEMP_DOWN_FROM_LIFETIME() {
        return function(sys, p) {
            return Fire._rescale(p.time_past, [0,sys._fire_tcalc_max], [1,0]);
        };
    }
    static get TEMP_UP_FROM_LIFETIME() {
        return function(sys, p) {
            return Fire._rescale(p.time_past, [0,sys._fire_tcalc_max], [0,1]);
        };
    }
    static get TEMP_FROM_DIST_TO_ORIGINAL_EMITTER() {
        return function(sys, p) {
            // temp based off of dist
            var dist = Pathfinder.distance_to(p.pos, p._fire[2]); // dist to original emitter
            return Fire._rescale(dist, [0,sys._fire_tcalc_max], [1,0]);
        };
    }
    static get TEMP_FROM_DIST_TO_CLOSEST_EMITTER() {
        return function(sys, p) {
            // find closest emitter
            var closest_dist_sq = Pathfinder.distance_to_squared(p.pos, sys._fire_emit_pts[0]);
            for (var i=1, pt=sys._fire_emit_pts[i]; i<sys._fire_emit_pts.length; i++) {
                var dist_sq = Pathfinder.distance_to_squared(p.pos, pt);
                if (dist_sq < closest_dist_sq)
                    closest_dist_sq = dist_sq;
            }
            // temp based off of dist
            return Fire._rescale(Math.sqrt(closest_dist_sq), [0,sys._fire_tcalc_max], [1,0]);
        };
    }
    static get ON_COLD() { return (sys, p) => p._fire[1] <= 0; }
    static get ON_HOT() { return (sys, p) => p._fire[1] >= 1; }
    static get ON_STOP() { return (sys, p) => Nickel.v2d.is_0(p._fire[0]); }

    /// (Private) List of possible emission points.
    _fire_emit_pts;

    /**
     * Callback from chroma color scaling.
     *
     * @callback chroma_color_scale
     * @param {Number} scale input for the current color scale
     * @returns {object} a css compatible color object
     */

    /**
     * @type {chroma_color_scale}
     */
    /// (Private) Chroma color scale callback function.
    _fire_clr_scale;

    /// (Private) Turbulence properties; each represents a bound of randomness.
    _fire_turbulence = {
        p0x : null, p0y : null, // initial position
        v0x : null, v0y : null, // initial velocity
        vx  : null, vy  : null, // velocity
        ax  : null, ay  : null, // force / acceleration
        siz : null, // scale
        glo : null, // glow radius
        clr : null, // color scale (0 to 1)
        hue : null, // hsl hue (0 to 360)
        lum : null, // hsl luminence (0 to 1)
        bri : null  // hsl brightness (0 to 1)
    }

    /// (Private) Initial velocity of each particle.
    _fire_init_vel;

    /// (Private) Continuous force applied on each particle.
    _fire_force;

    /// (Private) Initial jerk applied to net force of particle.
    _fire_jerk;

    /**
     * Callback for calculating temperature.
     *
     * @callback temperature_calc_method
     * @param {Fire} sys
     * @param {Particle} p ptc belonging to the above system
     * @returns {Number} temperature percent (between 0 and 1)
     */

    /**
     * @type {temperature_calc_method}
     */
    /// (Private) Temperature calculation method. (callback function)
    _fire_tcalc_method;

    /// (Private) Temperature calculation max parameter.
    _fire_tcalc_max;

    /// (Private) Max and min of particle scaling.
    _fire_scale_lims;

    /// (Private) Max and min of glow radius.
    _fire_radius_lims;

    /// (Private) Death condition.
    _fire_cnd_death;

}//end class