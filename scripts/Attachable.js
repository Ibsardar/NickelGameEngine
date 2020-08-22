////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Attachable
//  Filename:       Attachable.js
//  Date:           6/9/2019
//  Description:    Abstract class that describes an object that has the ability
//                  to attach onto another object.
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

export { Attachable };

/**
 * @class Attachable
 * 
 * Abstract class that describes an object that has the ability
 * to attach onto another object. Add and append functions are
 * included to help with standardizing attachables. The "attachee"
 * object must have a list of functions that are called inside
 * their "update" function.
 */
class Attachable {

    /// Default constructor.
    constructor() {}

    /**
     * Static Abstract function: meant to guide other attachable
     * objects to use a common function to attach their properties
     * to the input 'obj'. Utilize Attachable's add and append
     * functions here.
     * 
     * @param {object} obj object attaching things to
     * @param {object} [data] attachment details
     */
    static attach(obj, data) {

        //... attach new properties to obj (override)
    }

    /**
     * Static function: Attaches a getter/setter property.
     * 
     * @param {object} obj object that we are attaching this new propery to
     * @param {String} name name of property
     * @param {Function} get_f getter function
     * @param {Function} set_f setter function
     */
    static add_prop(obj, name, get_f, set_f) {

        Object.defineProperty(obj, name, {get: get_f, set: set_f});
    }

    /**
     * Static function: Attaches a variable/function.
     * 
     * @param {object} obj object that we are attaching this new variable to
     * @param {String} name name of variable
     * @param {object} val value of new variable
     */
    static add_var(obj, name, val) {

        obj[name] = val;
    }

    /**
     * @todo look for a less dependable method of function addition.
     * Static function: Attaches a new function to an existing function.
     * via an array. No arguments are passed into the function.
     * 
     * @requires 'lst' must be a list of functions called inside some other function
     * 
     * @param {Array} lst list of functions called within some other function
     * @param {Function} new_f function to append to function list
     */
    static append_func(lst, new_f) {

        lst.push(new_f);
    }

}//end Attachable