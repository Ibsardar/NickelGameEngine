////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Date:           10/8/2020
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

export { implement, isinterface };

/**
 * @class ImplementsManager
 * 
 * Static class - sudo implements checker with ES6 classes
 */
class ImplementsManager {

    /**
     * Marks a class as an implementer of another (interface).
     * 
     * @param {class} interface_class_ref interface
     * @returns {{in}} of ( implementer_class_ref ) => void
     * 
     * ---
     * Chained from above.
     * 
     * @param {class} implementer_class_ref implementer
     */
    static implements(interface_class_ref) {
        return {
            in : (implementer_class_ref) => {

                // validate types
                if (!(interface_class_ref instanceof Object)) {
                    console.error('ERROR: ImplementsManager>implements->in: interface class is of an unexpected type: ' + interface_class_ref + '.');
                    return;
                }
                if (!(interface_class_ref instanceof Object)) {
                    console.error('ERROR: ImplementsManager>implements->in: implementer class is of an unexpected type: ' + implementer_class_ref + '.');
                    return;
                }

                // validate if static properties of interface are defined in implementer (ignore parent classes)
                var interface_props = Object.getOwnPropertyNames(interface_class_ref);
                var implementer_props = Object.getOwnPropertyNames(implementer_class_ref);
                for (let int_prop of interface_props) {
                    var flag = false;
                    for (let imp_prop of implementer_props) {
                        if (int_prop === imp_prop) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        console.error('ERROR: ImplementsManager>implements->in: class "' + implementer_class_ref.name + '" does not implement "' + interface_class_ref.name + '" because the static property "' + int_prop + '" is not defined.');
                        return;
                    }
                }

                // validate if static properties of interface are defined in implementer (ignore parent classes)
                interface_props = Object.getOwnPropertyNames(interface_class_ref.prototype);
                implementer_props = Object.getOwnPropertyNames(implementer_class_ref.prototype);
                for (let int_prop of interface_props) {
                    var flag = false;
                    for (let imp_prop of implementer_props) {
                        if (int_prop === imp_prop) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        console.error('ERROR: ImplementsManager>implements->in: class "' + implementer_class_ref.name + '" does not implement "' + interface_class_ref.name + '" because the instance property "' + int_prop + '" is not defined.');
                        return;
                    }
                }

                // add interface class to implementer class's (and all its parent class's) list of implemented interfaces
                var curr_class = implementer_class_ref;
                while (curr_class.name) {
                    if (ImplementsManager._defined[curr_class.name])
                        ImplementsManager._defined[curr_class.name].push(interface_class_ref.name);
                    else ImplementsManager._defined[curr_class.name] = [interface_class_ref.name];
                    curr_class = Object.getPrototypeOf(curr_class);
                }
            }
        }
    }

    /**
     * Checks if an interface is implemented by a class.
     * 
     * @param {class|object} interface_class_ref_or_instance interface
     * @returns {{of}} of ( implementer_class_ref_or_instance ) => Boolean
     * 
     * ---
     * Chained from above.
     * 
     * @param {class|object} implementer_class_ref_or_instance implementer
     * @returns {Boolean} true/false
     */
    static isinterface(interface_class_ref_or_instance) {
        return {
            of : (implementer_class_ref_or_instance) => {
                var int_classname = (interface_class_ref_or_instance instanceof Function) ?
                    interface_class_ref_or_instance.name :
                    interface_class_ref_or_instance.constructor.name;
                var imp_classname = (implementer_class_ref_or_instance instanceof Function) ?
                    implementer_class_ref_or_instance.name :
                    implementer_class_ref_or_instance.constructor.name;
                if (ImplementsManager._defined[imp_classname])
                    if (ImplementsManager._defined[imp_classname].includes(int_classname))
                        return true;
                return false;
            }
        }
    }
    
    // defined classes that implement other classes
    static _defined = {
        /** implementer class_ref : array of interface class_refs */
    };

}//end class

// this is for exporting above
var implement = ImplementsManager.implements;
var isinterface = ImplementsManager.isinterface;