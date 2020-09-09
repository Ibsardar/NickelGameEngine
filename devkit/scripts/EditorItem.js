////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Bullet, Projectile
//  Filename:       Bullet.js
//  Date:           6/5/2019
//  Description:    Class that describes a bullet projectile.
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

import { Game } from "../../scripts/game.js";

export { EditorItem };

/**
 * @class EditorItem
 * 
 * A sprite object with helpful devkit functions.
 */
class EditorItem {

    _sprite;

    _owner; // who owns the sprite? if no owner, == sprite

    // format:
    // _jointts = {
    //      joint_name : Joint_instance,
    //      ...
    // }
    _joints = {};

    constructor(sprite, owner) {

        this._sprite = sprite;
        this._owner = owner;
    }

    get_joint(name) {}

    set_joint(name) {}

    get id () {}
    get name () {}
    set name (n) {}
    get pivot () {}
    set pivot (p) {}
    get url () {}
    set url (u) {}
    get scale () {}
    set scale (s) {}
    get size () {}
    get pos () {}
    set pos (p) {}
    get x () {}
    get y () {}
    get mode () {}
    set mode (m) {}
    get joints (js) {}

    
}//end class

/**
 * @private @class Joint
 */
class Joint {

    _art;

    _relative_position = [0,0];

    _connected_editor_items = [];

    constructor(parent_editor_item, point) {

        this._relative_position = [
            point[0] - parent_editor_item.x,
            point[1] - parent_editor_item.y
        ];

        this._art = new SimpleCircle(Game, 4, point);
    }

    connect(editor_item) {}

    disconnect(editor_item) {}

}//end class