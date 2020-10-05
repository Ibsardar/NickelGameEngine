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
import { Projectile } from "../../scripts/projectiles/Projectile.js";
import { Actor } from "../../scripts/Actor.js";
import { InteractionManager } from "../../scripts/managers/InteractionManager.js";
import { ParticleBulletSystem } from "../../scripts/projectiles/ParticleBulletSystem.js";

export { EditorItem };

/**
 * @class EditorItem
 * 
 * A sprite-like object with helpful devkit functions.
 */
class EditorItem {
    
    // object that owns/is sprite
    _o;

    // sprite of object
    _s;

    // update function
    _u = () => {};

    // format:
    // _joints = {
    //      name_of_joint : instance_of_Joint,
    //      ...
    // }
    _joints = {};

    /**
     * 
     * @param {Object} o object that owns a Sprite (or is a Sprite)
     * @param {String} dtor_name name of destructor function in 'o'
     */
    constructor(o, dtor_name=null) {

        this.object = o;
        if (dtor_name) this.destroy = () => this._o[dtor_name]();
    }

    update() {

        this._u();
    }

    /**
     * @override
     */
    destroy() {

    }

    get_joint(name) {}
    set_joint(name) {}

    get id () {return this._s.id}
    get name () {}
    set name (n) {}
    get pivot () {}
    set pivot (p) {}
    get url () {}
    set url (u) {}
    get scale () {return this._s.get_scalex()} // x and y should be same
    set scale (s) {this._s.set_scale(s)}
    get size () {return [this._s.get_w_orig(),this._s.get_h_orig()]}
    get pos () {return this._s.get_pos()}
    set pos (p) {this._s.set_pos(p[0],p[1])}
    get center () {return this._s.get_center()}
    set center (p) {this._s.set_center(p[0],p[1])}
    get ctr () {return this._s.get_center()}
    set ctr (p) {this._s.set_center(p[0],p[1])}
    get x () {return this._s.get_x()}
    get y () {return this._s.get_y()}
    get mode () {}
    set mode (m) {}
    get joints () {return this._joints}
    get sprite () {return this._s}
    get object () {return this._o}
    set object (o) {
        this._o = o;
        this._s = InteractionManager.sprite_of(o);
        if (!(o instanceof Projectile || o instanceof Actor || o instanceof ParticleBulletSystem))
            this._u = () => this._o.update();
        else this._u = () => {}
    }
    
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