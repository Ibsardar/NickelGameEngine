////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Limb
//  Filename:       Limb.js
//  Date:           7/16/2019
//  Description:    Class that describes a limb object that is part of
//                  some limb tree.
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

export { Limb };

/**
 * @class Limb
 * 
 * Class that describes a limb object that is part of
 * some limb tree. A limb object can also be the root node of
 * the limb tree, essentially making it a 'body'.
 */
class Limb {

    /// Default constructor.
    constructor(scene, img_data=false, collidable=false, overlap=true, offsets={}, pivot=null, is_loco=false) {

        this._limb_node = new TreeNode(this);

        // create sprite (or locomotive)
        if (img_data) {
            this.sprite = new Sprite(scene, img_data, true, null, collidable);
            this.sprite.bound = () => {};
            if (!pivot) this.sprite.set_origin_centered();
            else if (pivot) this.sprite.set_origin(pivot);
            if (is_loco) this.sprite = new Locomotive({sprite: this.sprite});
        
        // if no sprite, we assume an 'empty' limb where no sprite exists
        // ... so we disable it because this limb is only for reference (not use).
        } else {
            this.disable();
        }

        // set overlap and body offsets and default offsets
        this._overlaps_body = overlap;
        if (offsets.pos) {
            this._body_offset.pos = Nickel.v2d.copy(offsets.pos);
            this._default_offset.pos[0] = this._body_offset.pos[0];
            this._default_offset.pos[1] = this._body_offset.pos[1];
        }
        if (offsets.rot) {
            this._body_offset.rot = offsets.rot;
            this._default_offset.rot = this._body_offset.rot;
        }
        if (offsets.siz) {
            this._body_offset.siz = Nickel.v2d.copy(offsets.siz);
            this._default_offset.siz[0] = this._body_offset.siz[0];
            this._default_offset.siz[1] = this._body_offset.siz[1];
        }

        // return self
        return this;
    }

    /**
     * @todo increase performance <- is this needed???
     * 
     * Check if position, rotation, or scale has changed
     * on this limb respect to its body (parent limb).
     * If no body, limb is respect to [0,0].
     * Also, if no image has been recorded, record it.
     */
    _check_changes() {

        // 3 checks:
        // - if limb's parent changed or...
        // - if limb's sprite changed or...
        // - if limb's offset from body changed

        var body_node = this._limb_node.parent;

        // set positoin changed flag
        if ((body_node ? body_node.obj._limb_pos_changed : false) ||
            !Nickel.v2d.eq(this.sprite.get_pos(), this._limb_history.pos) ||
            !Nickel.v2d.eq(this._body_offset.pos, this._offset_history.pos))
            this._limb_pos_changed = true;
        else
            this._limb_pos_changed = false;
        
        // set rotation changed flag
        if ((body_node ? body_node.obj._limb_rot_changed : false) ||
            this.sprite.get_rot() !== this._limb_history.rot ||
            this._body_offset.rot !== this._offset_history.rot)
            this._limb_rot_changed = true;
        else
            this._limb_rot_changed = false;
        
        // set scale changed flag
        if ((body_node ? body_node.obj._limb_siz_changed : false) ||
            !Nickel.v2d.eq(this.sprite.get_scale(), this._limb_history.siz) ||
            !Nickel.v2d.eq(this._body_offset.siz, this._offset_history.siz))
            this._limb_siz_changed = true;
        else
            this._limb_siz_changed = false;

        // update history records
        this._limb_history.pos = this.sprite.get_pos();
        this._limb_history.rot = this.sprite.get_rot();
        this._limb_history.siz = this.sprite.get_scale();
        this._offset_history.pos = Nickel.v2d.copy(this._body_offset.pos);
        this._offset_history.rot = this._body_offset.rot;
        this._offset_history.siz = Nickel.v2d.copy(this._body_offset.siz);
    }

    /**
     * @todo docs
     */
    _update_limb() {

        // if root, locked offsets should directly affect sprite
        if (!this._limb_node.parent) {

            // IF LOCKED: correct position
            if (this._olocks.pos)
                this.sprite.set_pos(this._body_offset.pos[0], this._body_offset.pos[1]);

            // IF LOCKED: correct rotation
            if (this._olocks.rot)
                this.sprite.set_rot(this._body_offset.rot);

            // IF LOCKED: correct scale
            if (this._olocks.siz)
                this.sprite.set_scale2(this._body_offset.siz[0], this._body_offset.siz[1]);

            return;
        }

        var body = this._limb_node.parent.obj;

        // IF LOCKED: correct position of limb using body offset position
        if (this._olocks.pos) {
            if (this._limb_pos_changed || this._limb_rot_changed || this._limb_siz_changed ||
                body._limb_pos_changed || body._limb_rot_changed || body._limb_siz_changed) {

                var new_position = this.get_world_pt(this._body_offset.pos);
                this.sprite.set_pos(new_position[0], new_position[1]);
            }
        }

        // IF LOCKED: correct rotation of limb using body offset angle
        if (this._olocks.rot) {
            if (this._limb_rot_changed) {
                
                this.sprite.set_rot(this.get_world_ang(this._body_offset.rot));
            }
        }

        // IF LOCKED: correct scale of limb using body offset scale
        if (this._olocks.siz) {
            if (this._limb_siz_changed) {
                
                var new_scale = this.get_world_zoom(this._body_offset.siz);
                this.sprite.set_scale2(new_scale[0], new_scale[1]);
            }
        }
    }

    /**
     * @todo docs
     */
    _handle_transform() {

        this._check_changes();
        this._update_limb();
        for (let child of this._limb_node.children)
            child.obj._handle_transform();
    }

    /**
     * @todo docs
     */
    _handle_sprite() {

        for (let child of this._limb_node.children)
            if (!child.obj._overlaps_body)
                child.obj._handle_sprite();

        this.sprite.update();
        
        for (let child of this._limb_node.children)
            if (child.obj._overlaps_body)
                child.obj._handle_sprite();
    }

    /**
     * Attaches some limbs as new children of target limb.
     * 
     * @param {Limb} target limb to attach to
     * @param {...Limb} limbs new child limbs
     */
    static attach(target, ...limbs) {

        for (let limb of limbs)
            target._limb_node.in(limb._limb_node);
    }

    /**
     * Detaches target limb from its parent limb.
     * 
     * @param {Limb} target limb to detach
     */
    static detach(target) {

        if (target._limb_node.parent)
            target._limb_node.delete(true);
    }

    /**
     * Attaches some limbs as new children of self.
     * 
     * @param {...Limb} limbs new child limbs
     * @returns self (Limb)
     */
    attach(...limbs) {

        for (let limb of limbs)
            this._limb_node.in(limb._limb_node);

        return this;
    }

    /**
     * Detaches self from parent limb.
     * 
     * @returns self (Limb)
     */
    detach() {

        if (this._limb_node.parent)
            this._limb_node.delete(true);

        return this;
    }

    /**
     * Main update function: handles transformations and sprites.
     */
    update() {

        if (this._disabled) return;
        this._handle_transform();
        this._handle_sprite();
    }

    /**
     * @todo utilize data inside of '_olocks' in '_update_limb'
     * @todo HERE!!!!! ... <- are these issues resolved???
     * 
     * Locks the tagged transfomation to the body offset. Can
     * update current transformation as the body offset.
     * Tags:
     * - 'pos' : lock the position
     * - 'rot' : lock the rotation
     * - 'siz' : lock the scaling
     * - 'all' : locks all the above
     * 
     * @param {String} tag - 'pos', 'rot', 'siz', or 'all'
     * @param {Boolean} force_update force-set the current transformation
     */
    lock(tag='all', force_update=false) {
        if (tag == 'pos') {
            this._olocks.pos = true;
            if (force_update || this._olocks.pos)
                this._body_offset.pos = this.get_body_pt(this.sprite.get_pos());

        } else if (tag == 'rot') {
            this._olocks.rot = true;
            if (force_update || this._olocks.rot)
                this._body_offset.rot = this.get_body_ang(this.sprite.get_rot());

        } else if (tag == 'siz') {
            this._olocks.siz = true;
            if (force_update || this._olocks.siz)
                this._body_offset.siz = this.get_body_zoom(this.sprite.get_scale());

        } else if (tag == 'all') {
            this._olocks.pos = true;
            this._olocks.rot = true;
            this._olocks.siz = true;
            if (force_update || this._olocks.pos)
                this._body_offset.pos = this.get_body_pt(this.sprite.get_pos());
            if (force_update || this._olocks.rot)
                this._body_offset.rot = this.get_body_ang(this.sprite.get_rot());
            if (force_update || this._olocks.siz)
                this._body_offset.siz = this.get_body_zoom(this.sprite.get_scale());

        }
    }

    /**
     * Unlocks the tagged transfomation from the body offset.
     * Tags:
     * - 'pos' : unlock the position
     * - 'rot' : unlock the rotation
     * - 'siz' : unlock the scaling
     * - 'all' : unlocks all the above
     * 
     * @param {String} tag - 'pos', 'rot', 'siz', or 'all'
     */
    unlock(tag='all') {
        if (tag == 'pos') {
            this._olocks.pos = false;

        } else if (tag == 'rot') {
            this._olocks.rot = false;

        } else if (tag == 'siz') {
            this._olocks.siz = false;

        } else if (tag == 'all') {
            this._olocks.pos = false;
            this._olocks.rot = false;
            this._olocks.siz = false;

        }
    }
    
    /**
     * @todo DOES NOT WORK YET: FIX, TEST --> is this still an issue???
     * 
     * Returns the cooresponding point relative to the
     * body from a point in the world/domain of the body.
     * The world could be the body's parent limb, a canvas,
     * or even a Grid.
     * 
     * @param {Number[]} world_pt 
     * @returns {Number[]} point on body (parent limb)
     */
    get_body_pt(world_pt) {

        // create new var to not disturb input value
        var body_pt = [world_pt[0], world_pt[1]];

        // if no parent, the point is the same
        if (!this._limb_node.parent) return body_pt;

        // rotation vars
        var body = this._limb_node.parent.obj.sprite;
        var rad = body.get_rot() * Math.PI / 180;
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);

        // offset translate
        body_pt = Nickel.v2d.sub(body_pt, body.get_pos());

        // apply origin offset of body sprite
        body_pt = Nickel.v2d.sub(body_pt, body.get_origin());

        // apply origin offset of limb sprite (in opposite direction)
        body_pt = Nickel.v2d.add(body_pt, this.sprite.get_origin());
        
        // offset rotate
        var tmp_body_pt = [body_pt[0], body_pt[1]];
        body_pt[0] = tmp_body_pt[0] * cos - tmp_body_pt[1] * sin;
        body_pt[1] = tmp_body_pt[0] * sin + tmp_body_pt[1] * cos;
        
        // offset scale
        var s = body.get_scale();
        if (s[0] && s[1])
            body_pt = Nickel.v2d.div(body_pt, s);
        else
            throw new Error('Divide by Zero: Limb\'s sprite scale component is 0.');

        // return the point relative to the body
        return body_pt;
    }

    /**
     * Returns the cooresponding point in the world/domain that
     * the body lives in from a point relative to this body.
     * The world could be the body's parent limb, a canvas,
     * or even a Grid.
     * 
     * @param {Number[]} body_pt 
     * @returns {Number[]} point in world (body's domain/body's parent)
     */
    get_world_pt(body_pt) {

        // create new var to not disturb input value
        var world_pt = [body_pt[0], body_pt[1]];

        // if no parent, the point is the same
        if (!this._limb_node.parent) return world_pt;

        // rotation vars
        var body = this._limb_node.parent.obj.sprite;
        var rad = body.get_rot() * Math.PI / 180 * -1;
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);

        // offset scale
        world_pt = Nickel.v2d.mult_v(world_pt, body.get_scale());
        
        // offset rotate
        var tmp_world_pt = [world_pt[0], world_pt[1]];
        world_pt[0] = tmp_world_pt[0] * cos - tmp_world_pt[1] * sin;
        world_pt[1] = tmp_world_pt[0] * sin + tmp_world_pt[1] * cos;

        // offset translate
        world_pt = Nickel.v2d.add(world_pt, body.get_pos());

        // apply origin offset of body sprite
        world_pt = Nickel.v2d.add(world_pt, body.get_origin());

        // apply origin offset of limb sprite (in opposite direction)
        world_pt = Nickel.v2d.sub(world_pt, this.sprite.get_origin());

        // return point in the domain of this limb's parent
        return world_pt;
    }

    /**
     * Returns the cooresponding angle relative to the
     * body from an angle in the world/domain of the body.
     * The world could be the body's parent limb, a canvas,
     * or even a Grid.
     * 
     * @param {Number[]} world_ang in degrees
     * @returns {Number[]} angle on body (parent limb)
     */
    get_body_ang(world_ang) {

        // if no parent, the angle is the same
        if (!this._limb_node.parent) return world_ang;

        // return this limb's angle relative to the body
        return world_ang - this._limb_node.parent.obj.sprite.get_rot();
    }

    /**
     * Returns the cooresponding angle in the world/domain that
     * the body lives in from an angle relative to this body.
     * The world could be the body's parent limb, a canvas,
     * or even a Grid.
     * 
     * @param {Number[]} body_ang in degrees
     * @returns {Number[]} angle in world (body's domain/body's parent)
     */
    get_world_ang(body_ang) {

        // if no parent, the angle is the same
        if (!this._limb_node.parent) return body_ang;
        
        // return this limb's angle relative to the world
        return body_ang + this._limb_node.parent.obj.sprite.get_rot();
    }

    /**
     * Returns the cooresponding scale relative to the
     * body from a scale in the world/domain of the body.
     * The world could be the body's parent limb, a canvas,
     * or even a Grid.
     * 
     * @param {Number[]} world_zoom
     * @returns {Number[]} zoom amount on body (parent limb)
     */
    get_body_zoom(world_zoom) {

        // if no parent, the scale is the same
        if (!this._limb_node.parent)
            return Nickel.v2d.copy(world_zoom);
        
        // return this limb's scale factor relative to the body
        var body = this._limb_node.parent.obj.sprite;
        if (body.get_scalex() && body.get_scaley())
            return Nickel.v2d.div(world_zoom, body.get_scale());
        else
            throw new Error('Divide by Zero: Limb\'s sprite scale component is 0.');
    }

    /**
     * Returns the cooresponding scale in the world/domain that
     * the body lives in from a scale relative to this body.
     * The world could be the body's parent limb, a canvas,
     * or even a Grid.
     * 
     * @param {Number[]} body_zoom 
     * @returns {Number[]} zoom in world (body's domain/body's parent)
     */
    get_world_zoom(body_zoom) {

        // if no parent, the scale is the same
        if (!this._limb_node.parent)
            return Nickel.v2d.copy(body_zoom);

        // return this limb's scale factor relative to the world
        return Nickel.v2d.mult_v(body_zoom, this._limb_node.parent.obj.sprite.get_scale());
    }

    /**
     * Returns a new list of child Limbs
     * 
     * @returns {Limb[]} list of Limbs
     */
    children() {

        var children = [];
        for (let child_node of this._limb_node.children)
            children.push(child_node.obj);
        return children;
    }

    /**
     * Returns if this limb has children or not
     * 
     * @returns {Boolean} has children or not
     */
    has_children() {

        return !!this._limb_node.children.length;
    }

    /**
     * Runs a function on each child node.
     * 
     * @param {function} callback
     */
    each(callback = (child_limb) => {}) {

        for (let child_node of this._limb_node.children)
            callback(child_node.obj);
    }

    /**
     * Runs a function on all sub-nodes.
     * 
     * @param {function} callback
     */
    all(callback = (child_limb) => {}) {

        callback(this);
        for (let child_node of this._limb_node.children)
            child_node.obj.all(callback);
    }

    /**
     * Returns the limb tree as a list.
     * 
     * @returns {Limb[]} list of Limbs
     */
    list() {

        return (new Tree(this._limb_node)).preorder(true);
    }

    /**
     * @todo fix: new limb should take into account creating a new sprite/locomotive.
     * 
     * Returns a copy/clone of self.
     */
    copy() {

        // new Limb
        var copied = new Limb(this.sprite.scene, null, null, this.overlap, this._body_offset, false);
        copied.sprite = this.sprite.copy_frozen();
        copied.sprite.update_before = () => {};
        copied.sprite.update_more = () => {};
        copied._olocks.pos = this._olocks.pos;
        copied._olocks.rot = this._olocks.rot;
        copied._olocks.siz = this._olocks.siz;
        copied.actor = this.actor;
        
        return copied;
    }

    /// alias of copy
    clone = this.copy;

    /**
     * Returns a copy/clone of entire limb tree.
     */
    deep_copy() {

        // copy self
        var root = this.copy();

        // copy children recursively
        var children = this.children();
        for (let c of children)
            root.attach(c.deep_copy());

        // return root
        return root;
    }

    /**
     * Sets all body offsets to default.
     */
    default() {

        this._body_offset.pos[0] = this._default_offset.pos[0];
        this._body_offset.pos[1] = this._default_offset.pos[1];
        this._body_offset.rot    = this._default_offset.rot;
        this._body_offset.siz[0] = this._default_offset.siz[0];
        this._body_offset.siz[1] = this._default_offset.siz[1];
    }

    /**
     * Sets the all default offsets to body offsets.
     */
    set_default() {

        this._default_offset.pos[0] = this._body_offset.pos[0];
        this._default_offset.pos[1] = this._body_offset.pos[1];
        this._default_offset.rot    = this._body_offset.rot;
        this._default_offset.siz[0] = this._body_offset.siz[0];
        this._default_offset.siz[1] = this._body_offset.siz[1];
    }

    /**
     * Creates a sprite when there is no sprite.
     * Only changes the image when there is a sprite.
     * 
     * @param {Viewport} scene 
     * @param {object} img_data 
     * @param {Boolean} collidable 
     * @param {Number[]} pivot (if =true, then sets the center as the origin)
     * @param {object} offsets (if =false, don't offset that attribute)
     */
    set_sprite(scene, img_data, collidable=false, is_loco=false, pivot=false, off_pos=false, off_rot=false, off_siz=false) {
        
        // existing sprite, new image
        if (this.sprite)
            return this.set_image(img_data, pivot, off_pos, off_rot, off_siz);

        // new sprite
        this.sprite = new Sprite(scene, img_data, true, null, collidable);
        this.sprite.bound = () => {};
        if (!pivot) this.sprite.set_origin_centered();
        else if (pivot) this.sprite.set_origin(pivot);
        if (is_loco) this.sprite = new Locomotive({sprite: this.sprite});
        if (off_pos) this._body_offset.pos = Nickel.v2d.copy(off_pos);
        if (off_rot || off_rot === 0) this._body_offset.rot = Nickel.v2d.copy(off_rot);
        if (off_siz) this._body_offset.siz = Nickel.v2d.copy(off_siz);
    }

    /**
     * Sets the sprite-image, image-width, image-height,
     * sprite-origin, and limb-offsets relative to the parent limb.
     * 
     * @param {object} img_data 
     * @param {Number[]} origin (if =true, then sets the center as the origin)
     * @param {object} offsets (if =false, don't offset that attribute)
     */
    set_image(img_data, origin=false, off_pos=false, off_rot=false, off_siz=false) {

        this.sprite.set_pic(img_data);
        if (origin === true) this.sprite.set_origin_centered();
        else if (origin) this.sprite.set_origin(Nickel.v2d.copy(origin));
        if (off_pos) this._body_offset.pos = Nickel.v2d.copy(off_pos);
        if (off_rot || off_rot === 0) this._body_offset.rot = Nickel.v2d.copy(off_rot);
        if (off_siz) this._body_offset.siz = Nickel.v2d.copy(off_siz);
    }

    /**
     * Replaces this limb from its limb tree with a children-less, parent-less, limb.
     * Returns replaced limb (self) and disables it.
     * 
     * @param {Limb} limb the replacement limb
     * @returns the replaced limb. (if operation failed, returns false)
     */
    replace(limb) {

        if (limb._limb_node.children.length) {
            console.error('ERROR: Limb>replace: replacement limb cannot have children, remove them first.');
            return false;
        }

        // add current children to new node's children
        this._limb_node.replace(limb._limb_node);

        // disable self and return
        this.disable();
        return this;
    }

    /**
     * Deletes and disables self from limb tree.
     * 
     * @returns removed Limb (self)
     */
    remove() {

        // delete and disable self and return
        this._limb_node.delete();
        this.disable();
        return this;
    }

    /**
     * The parent limb_node of this limb, otherwise known as
     * the node of the body containing this limb.
     * 
     * @type {TreeNode} contains the parent Limb object
     */
    get body_node () { return this._limb_node.parent; }

    /**
     * The parent limb of this limb, otherwise known as
     * the body containing this limb.
     * 
     * @type {TreeNode} contains the parent Limb object
     */
    get body () { return this._limb_node.parent ? this._limb_node.parent.obj : null; }

    /**
     * Wether this limb will overlap its parent or not.
     * 
     * @type {Boolean} overlaps parent
     */
    get overlap () { return this._overlaps_body; }
    set overlap (bool) { this._overlaps_body = bool; }

    /**
     * The offset position of this limb from its body.
     * 
     * @type {Number[2]} x,y offset from body origin
     */
    get offset_position () { return this._body_offset.pos; }
    set offset_position (pos) { this._body_offset.pos = pos; }

    /**
     * The offset rotation of this limb from its body in degrees.
     * 
     * @type {Number} degrees offset from body's current rotation
     */
    get offset_rotation () { return this._body_offset.rot; }
    set offset_rotation (rot) { this._body_offset.rot = rot; }

    /**
     * The offset scale of this limb from its body.
     * 
     * @type {Number[2]} scale offset from body's current scale.
     */
    get offset_scale () { return this._body_offset.siz; }
    set offset_scale (siz) { this._body_offset.siz = siz; }

    /**
     * The offset scale of this limb from its body.
     * 
     * @type {Number[2]} scale offset from body's current scale.
     */
    get offset_scale () { return this._body_offset.siz; }
    set offset_scale (siz) { this._body_offset.siz = siz; }

    /**
     * Has the limb stopped updating or not.
     * 
     * @type {Boolean} disabled or not.
     */
    get disabled () { return this._disabled; }
    disable () { this._disabled = true; }
    enable () { this._disabled = false; }

    /// (Private) Is the limb updating or not.
    _disabled = false;

    /// (Private) TreeNode this limb is currently connected to.
    _limb_node;

    /// (Private) Last recorded transform data of self's sprite.
    _limb_history = {
        pos : [0,0],
        rot : 0,
        siz : [1,1]
    }

    /// (Private) Offsets relative to this limb's body.
    _body_offset = {
        pos : [0,0],
        rot : 0,
        siz : [1,1]
    }

    /// (Private) Default body offsets relative to this limb's body.
    _default_offset = {
        pos : [0,0],
        rot : 0,
        siz : [1,1]
    }

    /// (Private) Last recorded body offset data from limb.
    _offset_history = {
        pos : [0,0],
        rot : 0,
        siz : [1,1]
    }

    /// (Private) Wether or not limbs have changed in position since last frame.
    _limb_pos_changed = true;

    /// (Private) Wether or not limbs have changed in angle since last frame.
    _limb_rot_changed = true;

    /// (Private) Wether or not limbs have changed in scale since last frame.
    _limb_siz_changed = true;

    /// (Private) Indicates if this limb overlaps its parent limb or not.
    _overlaps_body;

    /** @todo implement corresponding functions **/ // <--- is this still an issue???
    /// (Private) Indicates if offset-forcing is on or off.
    _olocks = {
        pos : true,
        rot : true,
        siz : true
    };

    /// id of object
    id = Nickel.UTILITY.assign_id();

    /// Main sprite of limb (can be a Sprite or Locomotive)
    sprite;

    /// Main actor of limb (can be any type of Actor)
    /// Expected to be set when issuing a skeleton (that contins this limb) to an actor
    actor;

}//end Limb