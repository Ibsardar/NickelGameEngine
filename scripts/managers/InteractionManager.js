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

import { Game } from "../game.js";
import { GameManager } from "./GameManager.js";
import { Projectile } from "../projectiles/Projectile.js";
import { Actor } from "../Actor.js";
import { Skeleton } from "../Skeleton.js";
import { Limb } from "../Limb.js";

export { InteractionManager, InteractionManager as Interact }; // also export an alias

/**
 * @todo re-allocate chain function definitions to static private members.
 * @class InteractionManager
 * 
 * Static class - handles various types of user interactions.
 */
class InteractionManager {

    /// Internal global vars

    // Note: use defer_resets and auto_resets instead, those are more verbose
    static deferred_resets = false;

    // Note: use carefully externally. May not be accurate unless resetted at the end of each game loop.
    static last_mpos;

    /// Internal categorical vars
    
    static _lmb_click_data = {
        pressed : false
    }

    static _rmb_click_data = {
        pressed : false
    }

    static _drag_data = {
        curr : null,
        off : [0,0],
        pressed : false
    }

    static _hover_data = {

    }

    /// Main interaction functions

    static onleftclick(items) {

        // allows for chaining event callbacks
        var chain;
        var sub_chain;
        sub_chain = {
            do : (callback) => sub_chain,
            else : (callback) => sub_chain
        }
        chain = {
            top : (sort_by) => sub_chain,
            bottom : (sort_by) => sub_chain,
            all : (sort_by) => sub_chain,
            all_reversed : (sort_by) => sub_chain
        }

        // check for an unpressed lmb
        if (Game.mouse_upped === 0) {

            // stop pressing
            if (!InteractionManager.deferred_resets)
                InteractionManager._lmb_click_data.pressed = false;

        // check for a first time lmb click
        } else if (Game.mouse_curr === 0 && !InteractionManager._lmb_click_data.pressed) {

            // start pressing
            if (!InteractionManager.deferred_resets)
                InteractionManager._lmb_click_data.pressed = true;

            // trigger chain
            chain.top = (sort_by = (s) => s.id) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var under = InteractionManager.sprite_under_point(items, InteractionManager.last_mpos, sort_by, false);
                if (under) {

                    // trigger event
                    sub_chain.do = (f = (spr, ptr) => sub_chain) => {
                        f(under,saved);
                        return sub_chain;
                    }
                } else {

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }

                return sub_chain;
            }
            chain.bottom = (sort_by = (s) => s.id) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var under = InteractionManager.sprite_under_point(items, InteractionManager.last_mpos, sort_by, true);
                if (under) {

                    // trigger event
                    sub_chain.do = (f = (spr, ptr) => sub_chain) => {
                        f(under,saved);
                        return sub_chain;
                    }
                } else {

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }

                return sub_chain;
            }
            chain.all = (sort_by = (s) => s.id) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var unders = InteractionManager.sprites_under_point(items, InteractionManager.last_mpos, sort_by, false);
                if (unders.length) {

                    // trigger event
                    sub_chain.do = (f = (sprs, ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                } else {

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }

                return sub_chain;
            }
            chain.all_reversed = (sort_by = (s) => s.id) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var unders = InteractionManager.sprites_under_point(items, InteractionManager.last_mpos, sort_by, true);
                if (unders.length) {

                    // trigger event
                    sub_chain.do = (f = (sprs, ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                } else {

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }

                return sub_chain;
            }
        }

        return chain;
    }

    // aliases
    static clicked = InteractionManager.onleftclick;
    static onclick = InteractionManager.onleftclick;

    static onrightclick() {

    }
    
    static drag(items) {

        // allows for chaining event callbacks
        var chain;
        chain = {
            start : (callback) => chain,
            while : (callback) => chain,
            end : (callback) => chain
        }

        // check for a released lmb
        if (Game.mouse_upped === 0) {

            // trigger event
            if (InteractionManager._drag_data.curr) {
                InteractionManager.calc_mouse();
                var saved_spr = InteractionManager._drag_data.curr;
                var saved_ptr = Nickel.v2d.cp(InteractionManager.last_mpos);
                chain.end = (f = (spr, ptr) => chain) => {
                    f(saved_spr, saved_ptr);
                    return chain;
                }
            }

            InteractionManager._drag_data.pressed = false;
            InteractionManager._drag_data.curr = null;
        }

        // check for a continued lmb press
        else if (Game.mouse_curr === 0 && InteractionManager._drag_data.curr) {

            InteractionManager.calc_mouse();
            InteractionManager._drag_data.curr.set_pos(
                InteractionManager.last_mpos[0] - InteractionManager._drag_data.off[0],
                InteractionManager.last_mpos[1] - InteractionManager._drag_data.off[1]
            );

            // trigger event
            var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
            chain.while = (f = (spr, ptr) => chain) => {
                f(InteractionManager._drag_data.curr, saved);
                return chain;
            }
        }

        // check for a new lmb click
        else if (Game.mouse_curr === 0 && !InteractionManager._drag_data.pressed && !InteractionManager._drag_data.curr) {

            InteractionManager._drag_data.pressed = true;
            InteractionManager.calc_mouse();
            var under = InteractionManager.sprite_under_point(items, InteractionManager.last_mpos);
            if (under) {
                InteractionManager._drag_data.curr = under;
                InteractionManager._drag_data.off = [
                    InteractionManager.last_mpos[0] - under.get_x(),
                    InteractionManager.last_mpos[1] - under.get_y()
                ];

                // trigger event
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                chain.start = (f = (spr, ptr) => chain) => {
                    f(InteractionManager._drag_data.curr, saved);
                    return chain;
                }
            }
        }

        // enable chaining
        return chain;
    }

    static onhover() {

    }

    /// Other helpful methods

    /**
     *  Note: Call at the end of game loop and collect Grid's
     *        mouse position from here for efficiency.
     */
    static reset() {

        InteractionManager.last_mpos = [0,0];
        InteractionManager.reset_pressed();
    }

    /**
     *  @todo also handle drag resetting so you can have different drags
     *  Note: Call at the end of game loop and collect Grid's
     *        mouse position from here for efficiency.
     */
    static reset_pressed() {

        if (Game.mouse_upped === 0) {
            InteractionManager._lmb_click_data.pressed = false;
            InteractionManager._rmb_click_data.pressed = false;
        } else {
            if (Game.mouse_curr === 0 && !InteractionManager._lmb_click_data.pressed)
                InteractionManager._lmb_click_data.pressed = true;
            if (Game.mouse_curr === 0 && !InteractionManager._rmb_click_data.pressed)
                InteractionManager._rmb_click_data.pressed = true;
        }
    }

    /**
     * Must use InteractionManager.reset_pressed along with
     * this to allow multiple key presses before resetting
     * towards the bottom of your game loop.
     */
    static defer_resets() {

        InteractionManager.deferred_resets = true;
    }

    /**
     * Will cause there to be only one key pressed per
     * action type but no manual resetting is required.
     * This is the default.
     */
    static auto_resets() {

        InteractionManager.deferred_resets = false;
    }

    static sprites_under_point(items=[], pt=[0,0], sort_by = (s) => s.id, reversed=false, only_first=false) {

        var heap = new Heap(reversed ? 'min' : 'max');
        for (let item of items) {
            var spr = InteractionManager.sprite_of(item);
            if (spr.colliding_with(pt, false))
                heap.in(spr,sort_by(spr));
        }

        if (only_first)
            return heap.first() ? heap.first().obj : heap.first();
        return heap.sort();
    }

    static sprite_under_point(items=[], pt=[0,0], sort_by = (s) => s.id, reversed=false) {

        return InteractionManager.sprites_under_point(items, pt, sort_by, reversed, true);
    }

    static sprite_of(item) {

        if (item instanceof Sprite) return item; // handles Sprite, Locomotive
        if (item instanceof Projectile) return item.sprite; // handles Projectile
        if (item instanceof Limb) return item.sprite; // handles Limb
        if (item instanceof Skeleton) return item.body.sprite; // handles Skeleton
        if (item instanceof Actor) return item.skeleton.body.sprite; // handles Actor
        return false;
    }

    /**
     * Note: Use carefully when using externally. To use efficiently,
     * use with InteractionManager.reset function in your game loop.
     */
    static calc_mouse() {

        if (GameManager.world)
            InteractionManager.last_mpos = GameManager.world.get_grid_point([Game.mouse_x,Game.mouse_y]);
        else
            InteractionManager.last_mpos = [Game.mouse_x,Game.mouse_y];
    }

    /**
     * Note: Use carefully when using externally. To use efficiently,
     * use with InteractionManager.calc_mouse function in your game loop.
     */
    static mouse() {

        return InteractionManager.last_mpos;
    }
}//end class