////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       ParticleBulletSystem
//  Filename:       ParticleBulletSystem.js
//  Date:           10/3/2020
//  Description:    Abstract class that describes a particle bullet system.
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

export { ParticleBulletSystem };

/**
 * @class ParticleBulletSystem
 * 
 * Meant to be used as an abstract class for
 * creating different types of ParticleBulletSystems.
 */
class ParticleBulletSystem {

    /**
     * Default constructor.
     * 
     * @param  {Viewport} scene main viewport to paint on.
     * @param  {object} data data object of system parameters.
     * - > .particle_sys : (required without particle_sys_data) particle system object
     * - > .particle_sys_data : (required without particle_sys) particle system data
     * - > .script_effect : (optional) post update function; called every frame
     * - > .health : health amount
     * - > .on_create : (optional) particle create event trigger function
     * - > .on_hit : (optional) particle collision event trigger function
     * - > .on_destroyed : (optional) particle destroy event trigger function
     * - > .on_delete : (optional) particle delete event trigger function
     * - > .snd_create : (optional) sound effect on creation
     * - > .snd_hit : (optional) sound effect on target hit
     * - > .snd_destroy : (optional) sound on death
     */
    constructor(scene, data) {

        // set waiting on initialization state
        this._state = ParticleBulletSystem.WAITING_INIT;

        // set scene
        ParticleBulletSystem._scene = scene;

        // set/create particle system depending on input
        this._ps = data.particle_sys;
        if (!this._ps) this._ps = new ParticleSystem(data.particle_sys_data);

        // set script effect (default: none)
        if (data.script_effect) this.update_more = data.script_effect;

        // record initial health of each particle
        this._p_init_hp = data.health;

        // add event responses (default: no response)
        if (data.on_create) this.on('create', data.on_create);
        if (data.on_hit) this.on('hit', data.on_hit);
        if (data.on_destroyed) this.on('destroy', data.on_destroyed);
        if (data.on_delete) this.on('delete', data.on_delete);

        // add sound effects (default: none)
        this._snd_create = data.snd_create;
        this._snd_hit = data.snd_hit;
        this._snd_destroy = data.snd_destroy;
        
        // attach sound effects to events
        if (this._snd_create) this.on('create', (s, p) => s._snd_create.play());
        if (this._snd_hit) this.on('hit', (s, p, t) => s._snd_hit.play());
        if (this._snd_destroy) this.on('destroy', (s, p) => s._snd_destroy.play());

        // add an init function that will trigger the create event
        // for every particle that is emitted
        var this_pbs = this;
        this._ps.add_init_feature(ptc => ParticleBulletSystem.request_trigger(
            this_pbs,
            'create',
            this_pbs,
            ptc
        ));

        // initialize each particle with rememberance of its own death,
        // this will help in getting accurate destroy events
        this._ps.add_init_feature(ptc => ptc.was_dead = false);

        // override every particle's on-remove function so we can
        // trigger the delete event
        this._ps._on_particle_removed = ptc => ParticleBulletSystem.request_trigger(
            this_pbs,
            'delete',
            this_pbs,
            ptc
        );

        // increment counts
        ParticleBulletSystem._count++;

        // set initialization completed state
        this._state = ParticleBulletSystem.INITIALIZED;
    }
    
    /**
     * Static function: sets targets (reference) for a certain group.
     * 
     * @param {object[]} targets array reference of target sprites/points/shapes/hulls
     * @param {String} group group id of targets
     */
    static set_targets(targets, group) {

        ParticleBulletSystem._targets[group] = targets;
    }

    /** 
     * Static function: removes system + particles but not its quadtree
     * or targets from a certain group. Does not trigger delete event by
     * default. Does not internally destroy system by default. Does not
     * remove empty groups.
     * 
     * note: quadtree is not removed because it may have particles from
     * multiple systems. targets is not removed because other systems
     * may be using those targets.
     * 
     * @param {ParticleBulletSystem} system remove a system completely from static knowledge
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_system(system, trigger=false) {

        // trigger delete event for every particle
        if (trigger) {
            var ptcs = system._ps.queue.data();
            for (let ptc of ptcs)
                system._trigger('delete', system, ptc);
            system.destroy();
        }

        // find & remove system from within group
        var gp = ParticleBulletSystem._systems[system.group];
        for (var i in gp) {
            if (gp[i]._ps.id == system._ps.id) {
                gp = gp.splice(i, 1);
                break;
            }
        }
    }
    
    /**
     * Static function: removes a group and all its systems + particles,
     * targets, and quadtrees. Does not trigger delete event by default
     * Does not internally destroy particles by default.
     * 
     * @param {String} group group id of targets
     * @param {Boolean} [trigger=false] trigger delete events and destroy internally
     */
    static delete_group(group, trigger=false) {

        // decrement counts
        ParticleBulletSystem._count -= ParticleBulletSystem._counts[group];
        ParticleBulletSystem._dead_count -= ParticleBulletSystem._dead_counts[group];

        // trigger delete event for every particle
        if (trigger) {
            var gp = ParticleBulletSystem._systems[group];
            for (var i in gp) {
                var ptcs = gp[i]._ps.queue.data();
                for (let ptc of ptcs)
                    gp[i]._trigger('delete', gp[i], ptc);
                gp[i].destroy();
            }
        }

        delete ParticleBulletSystem._targets[group];
        delete ParticleBulletSystem._systems[group];
        delete ParticleBulletSystem._quadtrees[group];
        delete ParticleBulletSystem._counts[group];
        delete ParticleBulletSystem._dead_counts[group];
    }

    /**
     * Static function: removes all destroyed systems. Doesn't
     * remove empty groups. Does not trigger delete event by
     * default.
     * 
     * @param {Boolean} [trigger=false] trigger delete events
     */
    static delete_destroyed(trigger=false) {

        var ps = ParticleBulletSystem._systems;

        // for each destroyed system in every group:
        // - trigger delete if trigger=true
        // - remove from list
        for (var g in ps) {

            // if we want to trigger events
            if (trigger) {
                ps[g] = ps[g].filter(sys => {
                    if (!sys) return false;
                    if (sys._state == ParticleBulletSystem.DESTROYED) {
                        ParticleBulletSystem._dead_count--;
                        ParticleBulletSystem._dead_counts[g]--;
                        var ptcs = sys._ps.queue.data();
                        for (let ptc of ptcs)
                            sys._trigger('delete', sys, ptc);
                        return false;
                    } else
                        return true;
                });

            // if we don't want to trigger events 
            } else {
                ps[g] = ps[g].filter(sys =>{
                    if (!sys) return false;
                    if (sys._state == ParticleBulletSystem.DESTROYED) {
                        ParticleBulletSystem._dead_count--;
                        ParticleBulletSystem._dead_counts[g]--;
                        return false;
                    } else
                        return true;
                });
            }
        }
    }

    /**
     * Static function: Triggers events based on current state of particles.
     * Must be called at regular intervals (ex: 60 times per second i.e. 60fps).
     */
    static handle_triggers() {

        // handle triggers
        ParticleBulletSystem._handle_create_triggers();
        ParticleBulletSystem._handle_hit_triggers();
        ParticleBulletSystem._handle_destroy_triggers();
        ParticleBulletSystem._handle_delete_triggers();
    }

    /**
     * Private Static function: Triggers 'create' when particles are created.
     */
    static _handle_create_triggers() {

        // permit external trigger requests
        ParticleBulletSystem._resolve_trigger_requests('create');
    }

    /**
     * Private Static function: Triggers 'hit' when particles hit a target.
     */
    static _handle_hit_triggers() {

        // if no targets, only resolve external trigger requests
        if (!ParticleBulletSystem.target_is_available()) {
            ParticleBulletSystem._resolve_trigger_requests('hit');
            return;
        }
        
        // begin collision checking by preparing qaudtrees:
        // clear & fill all quadtrees with particles of same group (not same system)
        // * note: ignore all destroyed particles/systems *
        var ps = ParticleBulletSystem._systems;
        var qs = ParticleBulletSystem._quadtrees;
        for (var g in qs) {
            qs[g].clear();
            for (var i in ps[g]) {
                var sys = ps[g][i];
                if (sys._state != ParticleBulletSystem.DESTROYED && sys.collidable) {
                    var ptcs = sys._ps.queue.data();
                    for (let ptc of ptcs) {
                        if (!ptc.dead && ptc.collidable) {
                            var pos = ptc.get_canvas_pos();
                            var pair = {
                                ptc : ptc,
                                pbs : sys
                            };
                            qs[g].in(pair, [pos[0], pos[1]], [1, 1]); // particle-pbs pair, x, y, w, h
                        }
                    }
                }
            }
        }

        // check if particles are hitting targets from same group
        // * note: ignore all destroyed targets *
        CollisionEventHandler.handle(ParticleBulletSystem, ParticleBulletSystem._targets, qs, ['ptc'], ['sys']);

        /*// check if particles are hitting targets from same group
        // * note: ignore all destroyed targets *
        var ts = ParticleBulletSystem._targets;
        for (var g in ts) {
            for (var i in ts[g]) {

                // determine bounds
                // bounds (left, top, width, height)
                var b = [0, 0, 0, 0];

                // target
                var t = ts[g][i];

                // if target is a point
                if (Nickel.v2d.is(t)) {
                    b = [t[0], t[1], 1, 1];

                    // check nearby particles
                    var qt_list = qs[g].get([b[0], b[1]], [b[2], b[3]]);
                    for (var j in qt_list) {
                        var point = qt_list[j].entity.ptc.get_canvas_pos();
                        if (Collision_Detector.collides_point_point(t, point))
                            qt_list[j].entity.pbs._trigger(
                                'hit',
                                qt_list[j].entity.pbs,
                                qt_list[j].entity.ptc,
                                t);
                    }
                }

                // if target is polygon
                else if (t.type == 'SimplePoly') {
                    var bounds = t.get_bounds(true);
                    b = [bounds.x,
                         bounds.y,
                         bounds.w,
                         bounds.h];

                    // check nearby particles
                    var qt_list = qs[g].get([b[0], b[1]], [b[2], b[3]]);
                    for (var j in qt_list) {
                        var point = qt_list[j].entity.ptc.get_canvas_pos();
                        if (Collision_Detector.collides_poly_point(t, point))
                            qt_list[j].entity.pbs._trigger(
                                'hit',
                                qt_list[j].entity.pbs,
                                qt_list[j].entity.ptc,
                                t);
                    }
                }

                // if target is circle
                else if (t.type == 'SimpleCircle') {
                    b = [t.cx - t.radius,
                         t.cy - t.radius,
                         t.radius + t.radius,
                         t.radius + t.radius];
                
                    // check nearby particles
                    var qt_list = qs[g].get([b[0], b[1]], [b[2], b[3]]);
                    for (var j in qt_list) {
                        var point = qt_list[j].entity.ptc.get_canvas_pos();
                        if (Collision_Detector.collides_circle_point(t, point))
                            qt_list[j].entity.pbs._trigger(
                                'hit',
                                qt_list[j].entity.pbs,
                                qt_list[j].entity.ptc,
                                t);
                    }
                }

                // if target is sprite
                else {
                    // skip if target is destroyed
                    if (t.is_destroyed()) continue;
                    // else get bounds
                    b = [t.get_left(),
                         t.get_top(),
                         t.get_w_bound(),
                         t.get_h_bound()];

                    // check nearby particles
                    var qt_list = qs[g].get([b[0], b[1]], [b[2], b[3]]);
                    for (var j in qt_list) {
                        var point = qt_list[j].entity.ptc.get_canvas_pos();
                        if (t.colliding_with(point, false))
                            qt_list[j].entity.pbs._trigger(
                                'hit',
                                qt_list[j].entity.pbs,
                                qt_list[j].entity.ptc,
                                t);
                    }
                }
            }
        }
        */

        // permit external trigger requests
        ParticleBulletSystem._resolve_trigger_requests('hit');
    }

    /**
     * Private Static function: Triggers 'destroy' when particles are destroyed.
     */
    static _handle_destroy_triggers() {

        // check for destroyed particles
        var ps = ParticleBulletSystem._systems;
        for (var g in ps) {
            for (var i in ps[g]) {

                // system dead events
                if (ps[g][i].dead && ps[g][i]._state != ParticleBulletSystem.DESTROYED) {
                    ParticleBulletSystem._count--;
                    ParticleBulletSystem._dead_count++;
                    ParticleBulletSystem._counts[g]--;
                    ParticleBulletSystem._dead_counts[g]++;
                    ps[g][i]._state = ParticleBulletSystem.DESTROYED;
                    // can call an event like 'destroy-system' here...
                }

                // get all particles in this system
                var ptcs = ps[g][i]._ps.queue.data();

                // check if recently destroyed for each particle
                for (let ptc of ptcs) {
                    if (ptc.dead && !ptc.was_dead) {
                        ptc.was_dead = true;
                        ps[g][i]._trigger('destroy', ps[g][i], ptc); /** @warning ptc queue auto-pushes ptcs out so this won't fire reliably */
                    }
                }
            }
        }
        
        // permit external trigger requests
        ParticleBulletSystem._resolve_trigger_requests('destroy');
    }

    /**
     * Private Static function: Triggers 'delete' when particles are deleted.
     */
    static _handle_delete_triggers() {

        // permit external trigger requests
        ParticleBulletSystem._resolve_trigger_requests('delete');
    }

    /**
     * Resolves all trigger requests for a given event.
     * 
     * @param {String} ev name of event to be triggered
     */ 
    static _resolve_trigger_requests(ev) {

        var q = ParticleBulletSystem._trigger_requests[ev];
        while (q.count())
            q.out()();
    }

    /**
     * Static function: Requests a trigger to be executed controllably, otherwise,
     * trigger will have an immediate effect.
     * 
     * Triggers an event with the given arguments:
     * - 'create'   has 1 argument:     pbs, particle
     * - 'hit'      has 2 arguments:    pbs, particle, target
     * - 'destroy'  has 1 argument:     pbs, particle
     * - 'delete'   has 1 argument:     pbs, particle
     * 
     * @param  {ParticleBulletSystem} sys particle bullet system to trigger event from
     * @param  {String} ev name of event to be triggered
     * @param  {...object} args arguments to be passed into the response function
     */
    static request_trigger(sys, ev, ...args) {

        ParticleBulletSystem._trigger_requests[ev].in(function() {
            sys._trigger(ev, ...args);
        });
    }

    /**
     * Creates an empty group.
     * 
     * @param {String} g name of group
     */
    static create_group(g) {

        ParticleBulletSystem._targets[g] = [];
        ParticleBulletSystem._qt_bounds.w = ParticleBulletSystem._scene.get_w();
        ParticleBulletSystem._qt_bounds.h = ParticleBulletSystem._scene.get_h();
        ParticleBulletSystem._quadtrees[g] = new QuadTree(
            ParticleBulletSystem._qt_max_objs,
            ParticleBulletSystem._qt_max_depth,
            ParticleBulletSystem._qt_bounds
        );
        ParticleBulletSystem._projectiles[g] = [this];
        ParticleBulletSystem._counts[g] = 0;
        ParticleBulletSystem._dead_counts[g] = 0;
    }

    /**
     * True if any trace of a group exists. If non-existent, false.
     * 
     * @param {String} g name of group
     */
    static group_exists(g) {

        if (!ParticleBulletSystem._targets[g] ||
            !ParticleBulletSystem._quadtrees[g] ||
            !ParticleBulletSystem._projectiles[g] ||
            !ParticleBulletSystem._counts[g] ||
            !ParticleBulletSystem._dead_counts[g]) {
            return true;
        }
        return false;
    }

    /**
     * Static function: Transfers a system from its existing group to a new group.
     * (excludes destroyed, excludes deleted)
     * 
     * @param  {ParticleBulletSystem} p system object that wants to change group
     * @param  {String} g group to change to
     */
    static change_group(p, g) {
        
        if (ParticleBulletSystem.remove_from_group(p)) {
            if (!ParticleBulletSystem.group_exists(g))
                ParticleBulletSystem.create_group(g);
            ParticleBulletSystem._projectiles[g].push(p);
            ParticleBulletSystem._count++;
            ParticleBulletSystem._counts[g]++;
            return true;
        }
        return false;
    }

    /**
     * Static function: Removes a system from its existing group
     * without triggereing any delete/destroy events.
     * (excludes destroyed, excludes deleted)
     * 
     * @param  {ParticleBulletSystem} p system object that wants to change group
     * @returns false if not found or pbs is destroyed, else true
     */
    static remove_from_group(p, ignore_count=false) {

        // ignore dead
        if (p._state >= ParticleBulletSystem.DESTROYED)
            return false;
        
        var oldg = p.group;
        p.group = null;
        for (var i in ParticleBulletSystem._systems[oldg]) {
            var oldp = ParticleBulletSystem._systems[oldg][i];
            if (oldp.sprite.id == p.sprite.id) {
                ParticleBulletSystem._count--;
                ParticleBulletSystem._counts[g]--;
                ParticleBulletSystem._systems[oldg].splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Static function: Get entire list of systems from a certain group.
     * (includes destroyed, excludes deleted)
     * 
     * @param  {String} g group name
     * @return {ParticleBulletSystem[]} list of systems
     */
    static get_group(g) {
        return ParticleBulletSystem._systems[g];
    }

    /**
    * Searches all groups for an available target. Available targets
    * include a non-destroyed Sprite or Locomotive object or any other
    * object found in the target list.
    * (excludes destroyed sprites/locomotives, excludes deleted)
    * 
    * @return {Boolean} returns true if available target found
    */
    static target_is_available() {

        for (let g of Object.values(ParticleBulletSystem._targets))
            for (let t of g)
                if ((t.type == "Sprite" || t.type == "Locomotive")) {
                    if (!t.is_destroyed())
                        return true;
                } else
                    return true;
        return false;
    }

    /**
    * Number of groups.
    * (includes empty groups)
    * 
    * @type {Number} group count
    */
    static get number_of_groups() { return Object.keys(ParticleBulletSystem._systems).length; }

    /**
    * Number of systems in all groups.
    * (excludes destroyed)
    * 
    * @type {Number} system count
    */
    static get count() { return ParticleBulletSystem._count; }

    /**
    * Number of destroyed systems in all groups.
    * 
    * @type {Number} system count
    */
    static get dead_count() { return ParticleBulletSystem._dead_count; }

    /**
    * Number of particles in all groups.
    * 
    * @type {Number} particle count
    */
    static get particle_count() {
        var c = 0;
        for (var g in ParticleBulletSystem._systems)
            for (var s in ParticleBulletSystem._systems[g])
                c += ParticleBulletSystem._systems[g][s]._ps.queue.count();
        return c;
    }

    /**
    * Number of particles in this system.
    * 
    * @type {Number} particle count
    */
    get particle_count() { return this._ps.queue.count(); }

    /**
    * Number of systems in a certain group.
    * (excludes destroyed)
    * 
    * @param {String} group
    */
    static group_count(group) { return ParticleBulletSystem._counts[group]; }

    /**
    * Number of dead systems in a certain group.
    * 
    * @param {String} group
    */
    static group_dead_count(group) { return ParticleBulletSystem._dead_counts[group]; }

    /**
    * Number of particles in a certain group.
    * 
    * @param {String} group
    */
    static group_particle_count(group) {
        var c = 0;
        for (var s in ParticleBulletSystem._systems[group])
            c += ParticleBulletSystem._systems[group][s]._ps.queue.count();
        return c;
    }

    /**
     * Static: Calls 'update' on all particle bullet systems.
     * (excludes deleted, optionally includes destroyed)
     */
    static update_all(update_destroyed=false) {

        for (var h in ParticleBulletSystem._systems) {
            var g = ParticleBulletSystem._systems[h];
            for (var i in g) {
                var s = g[i];
                if (s) {
                    if (s._state != ParticleBulletSystem.DESTROYED || update_destroyed)
                        s.update();
                }
            }
        }
    }

    /**
     * Static: Calls 'update' on all particle bullet systems
     * EXCEPT groups specified in the groups list parameter.
     * (excludes deleted, optionally includes destroyed)
     */
    static update_except(groups=[], update_destroyed=false) {

        for (var h in ParticleBulletSystem._systems) {
            if (groups.find(h)) continue;
            var g = ParticleBulletSystem._systems[h];
            for (var i in g) {
                var s = g[i];
                if (s) {
                    if (s._state != ParticleBulletSystem.DESTROYED || update_destroyed)
                        s.update();
                }
            }
        }
    }

    /**
     * Static: Calls 'update' on all particle bullet systems
     * EXCEPT groups NOT specified in the groups list parameter.
     * (excludes deleted, optionally includes destroyed)
     */
    static update_only(groups=[], update_destroyed=false) {

        for (let h of groups) {
            var g = ParticleBulletSystem._systems[h];
            if (!g) continue;
            for (var i in g) {
                var s = g[i];
                if (s) {
                    if (s._state != ParticleBulletSystem.DESTROYED || update_destroyed)
                        s.update();
                }
            }
        }
    }

    /**
     * Called once per frame. Updates all changing parameters.
     */
    update() {

        // update particle bullet system
        this._ps.update();

        // update additional script
        this.update_more(this);
    }

    /**
     * Custom update called once per frame after main update.
     *
     * @param {ParticleBulletSystem} system
     */
    update_more(system) {

        //...override
    }

    /**
     * Destroys the internal particle system.
     */
    destroy() {

        // destroy system
        this._ps.destroy();

        // set state
        this._state = ParticleBulletSystem.DESTROYED;
    }

    /**
     * @todo IMPLEMENT CAREFULLY!
     * Returns a copy of this system.
     * 
     * @return {ParticleBulletSystem}
     */
    copy() {

        //...

        return null;
    }

    /**
     * Resets lifetime of system.
     * 
     * @param {Number} [milliseconds=0] new lifetime
     */
    reset_lifetime(milliseconds=0) {

        this._ps.set_lifetime(milliseconds);
    }

    /**
     * Callback for manipulating a particle.
     *
     * @callback manipulate_particle
     * @param {Particle} ptc particle to be manipulated
     */

    /**
     * Applies a callback function to every particle in the system.
     * The callback function takes in a Particle object.
     * 
     * @param {manipulate_particle} callback
     */
    apply(callback) {

        this._ps.apply_to_all(callback);
    }

    /**
     * Adds a callback function to be applied to each particle on
     * initialization.
     * 
     * @param {manipulate_particle} callback
     */
    add_initializer(callback) {

        this._ps.add_init_feature(callback);
    }

    /**
     * Adds a callback function to be applied to each particle on
     * every update.
     * 
     * @param {manipulate_particle} callback
     */
    add_updater(callback) {

        this._ps.add_move_feature(callback);
    }

    /**
     * Adds a callback function to be applied to each particle on
     * every draw.
     * 
     * @param {manipulate_particle} callback
     */
    add_painter(callback) {

        this._ps.add_draw_feature(callback);
    }

    /**
     * Private function: Requests a trigger for certain event to be executed immediately.
     * 
     * Triggers an event with the given arguments:
     * - 'create'   has 1 argument:     particle
     * - 'hit'      has 2 arguments:    particle, target
     * - 'destroy'  has 1 argument:     particle
     * - 'delete'   has 1 argument:     particle
     * 
     * @param  {String} ev name of event to be triggered
     * @param  {...object} args arguments to be passed into the response function
     */
    _trigger(ev, ...args) {

        // trigger all continuous responses for this event
        for (var i in this._events[ev])
            this._events[ev][i](...args);
    }
    
    /**
     * Responds with the given function every time the specified event is
     * triggered.
     * 
     * @param  {String} ev name of event to respond to
     * @param  {Function} func response function
     */
    on(ev, func) {

        // add given function to be triggered on selected event
        this._events[ev].push(func);

        // return index of this function
        return this._events[ev].length - 1;
    }

    /**
     * Removes a response that is continuously responding to the specified
     * event by using the given index.
     * 
     * @param  {String} ev name of event to remove from
     * @param  {Number} index index of response in event bus (returned by 'on')
     */
    remove_response(ev, index) {

        // remove specified response function from continous events
        this._events[ev].splice(index, 1);
    }

    /**
     * Resets all static data to the default values.
     */
    static reset() {

        ParticleBulletSystem._scene = null;
        ParticleBulletSystem._targets = {};
        ParticleBulletSystem._systems = {};
        ParticleBulletSystem._quadtrees = {};
        ParticleBulletSystem._qt_bounds = {
            x : 0,
            y : 0,
            w : 0,
            h : 0
        };
        ParticleBulletSystem._qt_max_objs = 3;
        ParticleBulletSystem._qt_max_depth = 4;
        ParticleBulletSystem._trigger_requests = {
            create : new Queue(),
            hit : new Queue(),
            destroy : new Queue(),
            delete : new Queue()
        }
        ParticleBulletSystem._count = 0;
        ParticleBulletSystem._dead_count = 0;
        ParticleBulletSystem._counts = {};
        ParticleBulletSystem._dead_counts = {};
    }

    /**
     * Coordinates of the system's origin.
     * 
     * @type {Array} x, y coordinates
     */
    get position() { return this._ps.pos; }
    set position(pos) { this._ps.pos = pos; }

    /**
     * Visibility of system.
     * 
     * @type {Boolean}
     */
    get visible() { return this._ps.visible; }
    set visible(bool) { this._ps.visible = bool; }

    /**
     * Parent object of system - helpful for particles because this allows
     * each particle to be able to reference parent via "ptc.sys.parent".
     * 
     * @type {object}
     */
    get parent() { return this._ps.parent; }
    set parent(par) { this._ps.parent = par; }

    /**
     * Amount of milliseconds that have passed since the system's birth.
     * note: can be reset by 'reset_lifetime'
     * 
     * @type {Number} milliseconds
     */
    get time_past() { return this._ps.time_past; }

    /**
     * Lifetime of system in milliseconds.
     * 
     * @type {Number} milliseconds
     */
    get lifetime() { return this._ps.time_total; }
    set lifetime(ms) { this._ps.time_total = ms; }

    /**
     * Paused state of system.
     * 
     * @type {Boolean}
     */
    get paused() { return this._ps.paused; }
    set paused(bool) { this._ps.paused = bool; }

    /**
     * Creation period in milliseconds.
     * 
     * @type {Number} milliseconds
     */
    get create_period() { return this._ps.period; }
    set create_period(ms) { this._ps.period = ms; }

    /**
     * Amount of particles created every creation period.
     * 
     * @type {Number} amount
     */
    get create_amount() { return this._ps.amount; }
    set create_amount(amt) { this._ps.amount = amt; }
    
    /**
     * Is the system collidable or not.
     * 
     * @type {Boolean} collidable or not
     */
    get collidable () { return this._collidable; }
    set collidable (bool) { this._collidable = bool; }

    /// (Static Constant) ParticleBulletSystem states.
    static get WAITING_INIT ()  { return 0; }
    static get INITIALIZED  ()  { return 1; }
    static get DESTROYED    ()  { return 2; }

    /// (Private Static) Viewport of all particle bullet systems.
    static _scene;

    /// (Private Static) Table object of grouped collidables.
    /// Format:
    ///     { 'group1' : [list of sprites/hulls/shapes/points] (reference)
    ///       'group2' : [another list of sprites/hulls/shapes/points] (reference)
    ///       ...etc
    ///     }
    static _targets = {};

    /// (Private Static) Table object of grouped systems.
    /// Format:
    ///     { 'group1' : [list of particle bullet systems] (reference)
    ///       'group2' : [another list of particle bullet systems] (reference)
    ///       ...etc
    ///     }
    static _systems = {};

    /// (Private Static) Table of quadtrees of grouped particles.
    /// Format:
    ///     { 'group1' : Quadtree of particles (reference)
    ///       'group2' : another Quadtree of particles (reference)
    ///       ...etc
    ///     }
    static _quadtrees = {};

    /// (Private Static) Quadtree bounds.
    static _qt_bounds = {
        x : 0,
        y : 0,
        w : 0,
        h : 0
    };

    /// (Private Static) Quadtree max objects per cell.
    static _qt_max_objs = 3;

    /// (Private Static) Quadtree max tree depth.
    static _qt_max_depth = 4;

    /// (Private Static) List of requests to trigger an event
    static _trigger_requests = {
        create : new Queue(),
        hit : new Queue(),
        destroy : new Queue(),
        delete : new Queue()
    }

    /// (Private Static) Tracking system counts.
    static _count = 0;
    static _dead_count = 0;
    static _dead_counts = {}
    static _counts = {}

    /// (Private) State of system.
    _state = 0;

    /// (Private) Event-effect-function lists of particle.
    _events = {
        create : [],
        hit : [],
        destroy : [],
        delete : []
    }

    /// (Private) The Particle System that is being treated as a Bullet emitter.
    _ps;

    /// (Private) Group this particle system belongs to.
    _group;

    /// (Private) Initial health of particle bullet.
    _p_init_hp;

    /// (Private) Sound effect on particle bullet creation
    _snd_create;

    /// (Private) Sound effect on particle bullet, target collision
    _snd_hit;

    /// (Private) Sound effect on particle bullet destruction
    _snd_destroy;

    /// (Private) indicates if this system is collidable
    _collidable = true;

    // Combat variables
    _dmg_normal; // damage to armor, then health
    _dmg_pierce; // damage to health only
    _dmg_break; // damage to armor only
    _effects = []; // effects applied on hit

}//end class