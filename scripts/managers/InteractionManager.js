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
 * @todo re-allocate chain function definitions to static private members. (anonymous functions are created on call, unlike static members) <-- to increase performance
 * @class InteractionManager
 * 
 * Static class - handles various types of user interactions.
 */
class InteractionManager {

    /// Internal global vars

    // Note: use defer_resets and auto_resets instead, those are more verbose
    static deferred_resets = false;

    // Ignore dead sprites.
    static dead_checks = false;

    // Note: use carefully externally. May not be accurate unless resetted at the end of each game loop.
    static last_mpos;

    /** Default sort_by function used for all interactive sorting */
    static default_sort_by = (item) => InteractionManager.sprite_of(item).id;

    /** Default compare_by function used for all interactive comparing */
    static default_compare_by = (item) => InteractionManager.sprite_of(item).id;

    /// Internal categorical vars
    
    static _lmb_click_data = {
        pressed : false
    }

    static _mmb_click_data = {
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

    /** idea:
     *  _hover_data = [
     *      {...}, {...}, {...}
     * ]
     * 
     * then use InteractionManager.update to update everything -> requires major refactoring
     * 
     * problem: currently, hover can only be used once...
     */
    static _hover_data = {
        last : null,
        over_group : false
    }

    /** format: [
     *      {classref:<Class>, path:['attribute','path,'to','sprite']},
     *      {classref:<Class>, path:['attribute','path,'to','sprite']},
     *      ...etc
     *  ]
     */
    static _class_data = [];

    /// Main interaction functions

    static onleftclick(items) {

        return InteractionManager._onclick(items, 0);
    }

    static onmiddleclick(items) {

        return InteractionManager._onclick(items, 1);
    }

    static onrightclick(items) {

        return InteractionManager._onclick(items, 2);
    }

    static onclick(items) {

        return InteractionManager._onclick(items);
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
                var saved_item = InteractionManager._drag_data.curr;
                var saved_ptr = Nickel.v2d.cp(InteractionManager.last_mpos);
                chain.end = (f = (item, ptr) => chain) => {
                    f(saved_item, saved_ptr);
                    return chain;
                }
            }

            InteractionManager._drag_data.pressed = false;
            InteractionManager._drag_data.curr = null;
        }

        // check for a continued lmb press
        else if (Game.mouse_curr === 0 && InteractionManager._drag_data.curr) {

            InteractionManager.calc_mouse();
            InteractionManager.sprite_of(InteractionManager._drag_data.curr).set_pos(
                InteractionManager.last_mpos[0] - InteractionManager._drag_data.off[0],
                InteractionManager.last_mpos[1] - InteractionManager._drag_data.off[1]
            );

            // trigger event
            var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
            chain.while = (f = (item, ptr) => chain) => {
                f(InteractionManager._drag_data.curr, saved);
                return chain;
            }
        }

        // check for a new lmb click
        else if (Game.mouse_curr === 0 && !InteractionManager._drag_data.pressed && !InteractionManager._drag_data.curr) {

            InteractionManager._drag_data.pressed = true;
            InteractionManager.calc_mouse();
            var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos);
            if (under) {
                InteractionManager._drag_data.curr = under;
                InteractionManager._drag_data.off = [
                    InteractionManager.last_mpos[0] - InteractionManager.sprite_of(under).get_x(),
                    InteractionManager.last_mpos[1] - InteractionManager.sprite_of(under).get_y()
                ];

                // trigger event
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                chain.start = (f = (item, ptr) => chain) => {
                    f(InteractionManager._drag_data.curr, saved);
                    return chain;
                }
            }
        }

        // enable chaining
        return chain;
    }

    /**
     * Can only be used once.
     * 
     * @param {[]} items 
     */
    static onhover(items) {

        // allows for chaining event callbacks
        var chain;
        var sub_chain;
        sub_chain = {
            enter : (callback) => sub_chain,
            leave : (callback) => sub_chain,
            while : (callback) => sub_chain,
            else : (callback) => sub_chain
        }
        chain = {
            top : (sort_by) => sub_chain,
            bottom : (sort_by) => sub_chain,
            all : (sort_by) => sub_chain,
            all_reversed : (sort_by) => sub_chain
        }

        // trigger chain
        chain.top = (sort_by = InteractionManager.default_sort_by, compare_by = InteractionManager.default_compare_by) => {
            
            InteractionManager.calc_mouse();
            var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
            var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos, sort_by, false);
            if (under) {
                if (InteractionManager._hover_data.last) {
                    if (compare_by(InteractionManager._hover_data.last) === compare_by(under)) {
                        
                        // case: if i have already been hovering over the detected item
                    
                        // trigger event
                        sub_chain.while = (f = (item,ptr) => sub_chain) => {
                            f(under,saved);
                            return sub_chain;
                        }
                    } else {

                        // case: if i have stopped hovering over the previous item but started hovering over the detected item

                        // set flag
                        var prev = InteractionManager._hover_data.last;
                        InteractionManager._hover_data.last = under;

                        // trigger events
                        sub_chain.leave = (f = (item,ptr) => sub_chain) => {
                            f(prev,saved);
                            return sub_chain;
                        }
                        sub_chain.enter = (f = (item,ptr) => sub_chain) => {
                            f(under,saved);
                            return sub_chain;
                        }
                    }
                } else {

                    // case: if i have started hovering over the detected item

                    // set flag
                    InteractionManager._hover_data.last = under;
                    
                    // trigger event
                    sub_chain.enter = (f = (item,ptr) => sub_chain) => {
                        f(under,saved);
                        return sub_chain;
                    }
                }
            } else {
                if (InteractionManager._hover_data.last) {

                    // case: if i have stopped hovering over the previous item

                    // set flag
                    var prev = InteractionManager._hover_data.last;
                    InteractionManager._hover_data.last = null;
                    
                    // trigger event
                    sub_chain.leave = (f = (item,ptr) => sub_chain) => {
                        f(prev,saved);
                        return sub_chain;
                    }
                } else {

                    // case: if i am not hovering over anything

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }
            }
            return sub_chain;
        }
        chain.bottom = (sort_by = InteractionManager.default_sort_by, compare_by = InteractionManager.default_compare_by) => {

            InteractionManager.calc_mouse();
            var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
            var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos, sort_by, true);
            if (under) {
                if (InteractionManager._hover_data.last) {
                    if (compare_by(InteractionManager._hover_data.last) === compare_by(under)) {
                        
                        // case: if i have already been hovering over the detected item
                    
                        // trigger event
                        sub_chain.while = (f = (item,ptr) => sub_chain) => {
                            f(under,saved);
                            return sub_chain;
                        }
                    } else {

                        // case: if i have stopped hovering over the previous item but started hovering over the detected item

                        // set flag
                        var prev = InteractionManager._hover_data.last;
                        InteractionManager._hover_data.last = under;

                        // trigger events
                        sub_chain.leave = (f = (item,ptr) => sub_chain) => {
                            f(prev,saved);
                            return sub_chain;
                        }
                        sub_chain.enter = (f = (item,ptr) => sub_chain) => {
                            f(under,saved);
                            return sub_chain;
                        }
                    }
                } else {

                    // case: if i have started hovering over the detected item

                    // set flag
                    InteractionManager._hover_data.last = under;
                    
                    // trigger event
                    sub_chain.enter = (f = (item,ptr) => sub_chain) => {
                        f(under,saved);
                        return sub_chain;
                    }
                }
            } else {
                if (InteractionManager._hover_data.last) {

                    // case: if i have stopped hovering over the previous item

                    // set flag
                    var prev = InteractionManager._hover_data.last;
                    InteractionManager._hover_data.last = null;
                    
                    // trigger event
                    sub_chain.leave = (f = (item,ptr) => sub_chain) => {
                        f(prev,saved);
                        return sub_chain;
                    }
                } else {

                    // case: if i am not hovering over anything

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }
            }
            return sub_chain;
        }
        chain.all = (sort_by = InteractionManager.default_sort_by) => {

            InteractionManager.calc_mouse();
            var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
            var unders = InteractionManager.items_under_point(items, InteractionManager.last_mpos, sort_by, false);
            if (unders.length) {
                if (InteractionManager._hover_data.over_group) {
                        
                    // case: if i have already been hovering over the detected item(s)
                
                    // trigger event
                    sub_chain.while = (f = (items,ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                } else {

                    // case: if i have started hovering over the detected item(s)

                    // set flag
                    InteractionManager._hover_data.over_group = true;
                    
                    // trigger event
                    sub_chain.enter = (f = (items,ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                }
            } else {
                if (InteractionManager._hover_data.over_group) {

                    // case: if i have stopped hovering over the previous item(s)

                    // set flag
                    InteractionManager._hover_data.over_group = false;
                    
                    // trigger event
                    sub_chain.leave = (f = (items,ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                } else {

                    // case: if i am not hovering over anything

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }
            }
            return sub_chain;
        }
        chain.all_reversed = (sort_by = InteractionManager.default_sort_by) => {

            InteractionManager.calc_mouse();
            var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
            var unders = InteractionManager.items_under_point(items, InteractionManager.last_mpos, sort_by, true);
            if (unders.length) {
                if (InteractionManager._hover_data.over_group) {
                        
                    // case: if i have already been hovering over the detected item(s)
                
                    // trigger event
                    sub_chain.while = (f = (items,ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                } else {

                    // case: if i have started hovering over the detected item(s)

                    // set flag
                    InteractionManager._hover_data.over_group = true;
                    
                    // trigger event
                    sub_chain.enter = (f = (items,ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                }
            } else {
                if (InteractionManager._hover_data.over_group) {

                    // case: if i have stopped hovering over the previous item(s)

                    // set flag
                    InteractionManager._hover_data.over_group = false;
                    
                    // trigger event
                    sub_chain.leave = (f = (items,ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                } else {

                    // case: if i am not hovering over anything

                    // trigger event
                    sub_chain.else = (f = (ptr) => sub_chain) => {
                        f(saved);
                        return sub_chain;
                    }
                }
            }
            return sub_chain;
        }
        return chain;
    }

    // aliases
    static clicked = InteractionManager.onclick;
    static leftclicked = InteractionManager.onleftclick;
    static rightclicked = InteractionManager.onrightclick;
    static onwheelclick = InteractionManager.onmiddleclick;
    static wheelclicked = InteractionManager.onmiddleclick;
    static middleclicked = InteractionManager.onmiddleclick;
    static hover = InteractionManager.onhover;

    /// Other helpful methods

    /**@todo */
    static update() {

        // todo -> encapsulate optimization of mpos calculations (only calc once per update)
    }

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
     *        mouse position near this function call for efficiency.
     */
    static reset_pressed() {

        // stop pressing the currently unpressed mb
        InteractionManager._mb_press(Game.mouse_upped, false);

        // check for any first-time left, middle, or right click
        if (InteractionManager._mb_first_click(-1))

            // start pressing
            InteractionManager._mb_press(Game.mouse_curr, true);
    }

    /**
     * Dead sprites not included in selections.
     */
    static skip_dead = () => InteractionManager.dead_checks = true;

    /**
     * Dead sprites are included in selection (this is the default behaviour)
     */
    static dont_skip_dead = () => InteractionManager.dead_checks = false;

    /**
     * Must use InteractionManager.reset_pressed along with
     * this to allow multiple key presses before resetting
     * towards the bottom of your game loop.
     */
    static defer_resets = () => InteractionManager.deferred_resets = true;

    /**
     * Will cause there to be only one key pressed per
     * action type but no manual resetting is required.
     * This is the default.
     */
    static auto_resets = () => InteractionManager.deferred_resets = false;

    static items_under_point(items=[], pt=[0,0], sort_by = InteractionManager.default_sort_by, reversed=false, only_first=false) {

        if (!items.length) return [];

        var heap = new Heap(reversed ? 'min' : 'max');
        for (let item of items) {
            var spr = InteractionManager.sprite_of(item);
            if (InteractionManager.dead_checks && spr.is_dead()) continue; // ignore dead sprites
            if (spr.colliding_with(pt, false))
                heap.in(item,sort_by(item));
        }

        if (only_first)
            return heap.first() ? heap.first().obj : heap.first();
        return heap.sort();
    }

    static item_under_point(items=[], pt=[0,0], sort_by = InteractionManager.default_sort_by, reversed=false) {

        if (!items.length) return null;
        return InteractionManager.items_under_point(items, pt, sort_by, reversed, true);
    }

    static sprite_of(item) {

        if (item instanceof Sprite) return item; // handles Sprite, Locomotive
        if (item instanceof Projectile) return item.sprite; // handles Projectile
        if (item instanceof Limb) return item.sprite; // handles Limb
        if (item instanceof Skeleton) return item.body.sprite; // handles Skeleton
        if (item instanceof Actor) return item.skeleton.body.sprite; // handles Actor
        for (let d of InteractionManager._class_data)
            if (item instanceof d.classref) return Nickel.util.subprop(d.path, item);
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

    /**
     * Registers a new Class (along with a Sprite path) to be recognized for interactivity.
     * 
     * @param {Class} classref 
     * @param {[]} attribute_path_to_sprite if [], then Class is/extends Sprite class.
     *                                      If ['a'], then instance_of_class['a'] = instance_of_sprite
     *                                      If ['a', 'b'], then instance_of_class['a']['b'] = instance_of_sprite
     * @returns registration_id (used as a parameter in the deregister function)
     */
    static register(classref, attribute_path_to_sprite=[]) {

        return InteractionManager._class_data.push({
            classref: classref,
            path: attribute_path_to_sprite
        }) - 1;
    }

    /**
     * Deregisters an existing custom added Class so it is not recognized as interactable anymore.
     * If no ID is given, deregister all custom added Classes.
     * 
     * @param {Number} registration_id ID returned from register function
     */
    static deregister(registration_id=null) {

        if (registration_id === null)
            InteractionManager._class_data = [];
        else
            InteractionManager._class_data.splice(registration_id, 1);
    }

    // private helpers

    /**
     * mb = mouse button:
     * -1 : any
     *  0 : left
     *  1 : middle
     *  2 : right
     * 
     * @param {Object} items 
     * @param {Number} mb 
     */
    static _onclick(items, mb=-1) {

        // allows for chaining event callbacks
        var chain;
        var sub_chain;
        sub_chain = {
            do : (callback) => sub_chain,
            else : (callback) => sub_chain,
            while : (callback) => sub_chain
        }
        chain = {
            top : (sort_by) => sub_chain,
            bottom : (sort_by) => sub_chain,
            all : (sort_by) => sub_chain,
            all_reversed : (sort_by) => sub_chain
        }

        // check for an unpressed mb
        if (InteractionManager._mb_upped(mb)) {

            // stop pressing
            if (!InteractionManager.deferred_resets)
                InteractionManager._mb_press(Game.mouse_upped, false);

        // check for a first time mb click
        } else if (InteractionManager._mb_first_click(mb)) {

            // start pressing
            if (!InteractionManager.deferred_resets)
                InteractionManager._mb_press(Game.mouse_curr, true);

            // trigger chain
            chain.top = (sort_by = InteractionManager.default_sort_by) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos, sort_by, false);
                if (under) {

                    // trigger event
                    sub_chain.do = (f = (item, ptr) => sub_chain) => {
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
            chain.bottom = (sort_by = InteractionManager.default_sort_by) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos, sort_by, true);
                if (under) {

                    // trigger event
                    sub_chain.do = (f = (item, ptr) => sub_chain) => {
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
            chain.all = (sort_by = InteractionManager.default_sort_by) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var unders = InteractionManager.items_under_point(items, InteractionManager.last_mpos, sort_by, false);
                if (unders.length) {

                    // trigger event
                    sub_chain.do = (f = (items, ptr) => sub_chain) => {
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
            chain.all_reversed = (sort_by = InteractionManager.default_sort_by) => {

                InteractionManager.calc_mouse();
                var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                var unders = InteractionManager.items_under_point(items, InteractionManager.last_mpos, sort_by, true);
                if (unders.length) {

                    // trigger event
                    sub_chain.do = (f = (items, ptr) => sub_chain) => {
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

        // if mb is already clicked
        } else {

            if ((mb === 0 && InteractionManager._lmb_click_data.pressed) ||
                (mb === 1 && InteractionManager._mmb_click_data.pressed) ||
                (mb === 2 && InteractionManager._rmb_click_data.pressed)) {
                
                // trigger chain
                chain.top = (sort_by = InteractionManager.default_sort_by) => {

                    InteractionManager.calc_mouse();
                    var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                    var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos, sort_by, false);
                    
                    // trigger event
                    sub_chain.while = (f = (item, ptr) => sub_chain) => {
                        f(under,saved);
                        return sub_chain;
                    }
                    return sub_chain;
                }
                chain.bottom = (sort_by = InteractionManager.default_sort_by) => {

                    InteractionManager.calc_mouse();
                    var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                    var under = InteractionManager.item_under_point(items, InteractionManager.last_mpos, sort_by, true);
                    
                    // trigger event
                    sub_chain.while = (f = (item, ptr) => sub_chain) => {
                        f(under,saved);
                        return sub_chain;
                    }
                    return sub_chain;
                }
                chain.all = (sort_by = InteractionManager.default_sort_by) => {

                    InteractionManager.calc_mouse();
                    var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                    var unders = InteractionManager.items_under_point(items, InteractionManager.last_mpos, sort_by, false);
                    
                    // trigger event
                    sub_chain.while = (f = (items, ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                    return sub_chain;
                }
                chain.all_reversed = (sort_by = InteractionManager.default_sort_by) => {

                    InteractionManager.calc_mouse();
                    var saved = Nickel.v2d.cp(InteractionManager.last_mpos);
                    var unders = InteractionManager.items_under_point(items, InteractionManager.last_mpos, sort_by, true);
                    
                    // trigger event
                    sub_chain.while = (f = (items, ptr) => sub_chain) => {
                        f(unders,saved);
                        return sub_chain;
                    }
                    return sub_chain;
                }
            }
        }
        return chain;
    }

    static _mb_upped(mb=-1) {
        if (mb === -1) return Game.mouse_upped === 0 || Game.mouse_upped === 1 || Game.mouse_upped === 2
        else return Game.mouse_upped === mb;
    }

    static _mb_first_click(mb=-1) {
        if (mb === -1) {
            return (Game.mouse_curr === 0 && !InteractionManager._lmb_click_data.pressed) ||
            (Game.mouse_curr === 1 && !InteractionManager._mmb_click_data.pressed) ||
            (Game.mouse_curr === 2 && !InteractionManager._rmb_click_data.pressed);
        } else
            return Game.mouse_curr === mb &&
                (mb === 0 ? !InteractionManager._lmb_click_data.pressed :
                    mb === 1 ? !InteractionManager._mmb_click_data.pressed :
                        mb === 2 ? !InteractionManager._rmb_click_data.pressed : null);
    }

    static _mb_press(mb=-1, start=true) {
        if (start) {
            if (mb === -1) {
                InteractionManager._lmb_click_data.pressed = true;
                InteractionManager._mmb_click_data.pressed = true;
                InteractionManager._rmb_click_data.pressed = true;
            } else if (mb === 0) {
                InteractionManager._lmb_click_data.pressed = true;
            } else if (mb === 1) {
                InteractionManager._mmb_click_data.pressed = true;
            } else if (mb === 2) {
                InteractionManager._rmb_click_data.pressed = true;
            }
        } else {
            if (mb === -1) {
                InteractionManager._lmb_click_data.pressed = false;
                InteractionManager._mmb_click_data.pressed = false;
                InteractionManager._rmb_click_data.pressed = false;
            } else if (mb === 0) {
                InteractionManager._lmb_click_data.pressed = false;
            } else if (mb === 1) {
                InteractionManager._mmb_click_data.pressed = false;
            } else if (mb === 2) {
                InteractionManager._rmb_click_data.pressed = false;
            }
        }
    }
}//end class