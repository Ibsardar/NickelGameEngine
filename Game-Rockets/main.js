////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Main
//  Filename:       main.js
//  Date:           6/5/2019
//  Description:    Main script dependant module to be included towards the end
//                  of the html file. Contains game loop implementation.
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

// load modules
import { Game } from '../scripts/game.js';
import { DATA } from '../scripts/data_loader.js';
import { Projectile } from '../scripts/projectiles/Projectile.js';
import { Bullet } from '../scripts/projectiles/Bullet.js';
import { StickyBullet } from '../scripts/projectiles/StickyBullet.js';
import { SmartBullet } from '../scripts/projectiles/SmartBullet.js';
import { ParticleBulletSystem } from '../scripts/projectiles/ParticleBulletSystem.js';
import { GlowPBS } from '../scripts/projectiles/GlowPBS.js';
import { Fire } from '../scripts/projectiles/Fire.js';
import { Limb } from '../scripts/Limb.js';

// tilemap
var Tilemap = new Grid(DATA.GRID);

// sprites
var Test = new Sprite(Game, DATA.IMG.CREEP_01);
Test.bound = function() {}
Test.set_center(400,200);
Test.set_ang_speed(1.5);
Test.set_speed(2);
Test.set_scale(8);///////////////////////////////////junk
var TestLoco = new Locomotive({
    scene:          Game,
    img_data:       DATA.IMG.NECRON_UNIT, //DATA.IMG.CREEP_03,
    hull_exists:    true,
    hull:           null,
    max_rot:        15
});
TestLoco.set_scale2(4,4);///////////////////////junk
TestLoco.set_center(300,300);
TestLoco.set_speed(2);
TestLoco.bound = function() {
    var w = this.scene.get_w();
    var h = this.scene.get_h();
    var cx = this.get_cx();
    var cy = this.get_cy();
    var new_cx = cx;
    var new_cy = cy;
    var wrap = false;

    // wrap horizontally (and flip vertically)
    if (cx < 0) {new_cx = w; new_cy = h - new_cy; wrap = true}
    else if (cx > w) {new_cx = 0; new_cy = h - new_cy; wrap = true}

    // wrap vertically (and flip horizontally)
    if (cy < 0) {new_cy = h; new_cx = w - new_cx; wrap = true}
    else if (cy > h) {new_cy = 0; new_cx = w - new_cx; wrap = true}

    // wrap to new position
    if (wrap) this.set_center(new_cx, new_cy);
}

// projectiles
DATA.TESTPROJ.targets.push(Test);
DATA.TESTPROJ.behaviors.flee.targets.push(Test);
DATA.TESTPROJ.behaviors.flee.targets.push(TestLoco);
DATA.TESTPROJ.behaviors.seek.targets.push(TestLoco);
DATA.TESTPROJ.behaviors.avoid.targets.push(Test);
//DATA.TESTPROJ.behaviors.follow.path.push(Test);
DATA.TESTPROJ.behaviors.follow.path.push(TestLoco);
DATA.TESTPROJ.behaviors.follow.path.push([100, 300]);
DATA.TESTPROJ.behaviors.follow.path.push(TestLoco);
DATA.TESTPROJ.behaviors.follow.path.push([600, 200]);
var reset_view_on_space = function() {
    if (Game.key_upped == Nickel.KEYCODES.SPACE) {
        Tilemap.reset_transform();
    }
}
var behave_with_mouse = function() {
    //TestLoco.seek3(Tilemap.get_mouse(), 1, true);
    TestLoco.set_speed(2);
    if (!TestLoco.arrive2(Tilemap.get_mouse(), 150, 3, true)) {
        //TestLoco.ease_to_speed(2, 0.05);
        TestLoco.wander(1, 90, true, 15);
    }
}
var test_proj_on_akey = function() {
    //if (Game.key_upped == Nickel.KEYCODES.K_A) {
    if (Game.key_downs[Nickel.KEYCODES.K_A]) {
        //var p = new Projectile(Game, DATA.TESTPROJ);
        //var p = new Bullet(Game, DATA.TESTPROJ);
        //var p = new StickyBullet(Game, DATA.TESTPROJ);
        var p = new SmartBullet(Game, DATA.TESTPROJ);
        Tilemap.load_sprite(p);
        DATA.TESTPROJ.behaviors.boids.targets.push(p.sprite);
        DATA.TESTPBS.targets.push(p.sprite);

        var ms = Tilemap.get_mouse();

        p.position = ms;
        p.speed = 5;
        p.acceleration = 0.0;
        p.direction = 0;
        p.max_rotation = 15;
        p.scale = [1.5, 1.5];
    }
    //Game.reset_key_upped();
    //Game.reset_key(Nickel.KEYCODES.K_A);
}
var fire_to_mouse = function(fire) {
    fire._fire_emit_pts[0] = Tilemap.get_mouse();
}

// particle bullets
DATA.TESTPBS.targets.push(Test);
DATA.TESTPBS.targets.push(TestLoco);
//var TestSpray = new ParticleBulletSystem(Game, DATA.TESTPBS);
var TestSpray = new GlowPBS(Game, DATA.TESTPBS);
var TestFire = new Fire(Game, DATA.TESTPBS);
TestSpray.position = Game.get_center();
var ptc_spd = 2;
var ps10 = ptc_spd * 10;
TestSpray.add_initializer(p => {
    p.set_canvas_pos(Tilemap.get_mouse()); // start at mouse
    p.lifetime = 10000; // 10 seconds
    p.opacity = 1;
    p.size = [8,8];
    p.spd = [Nickel.util.r_num(-ps10,ps10)/10, Nickel.util.r_num(-ps10,ps10)/10];
    p.rot = 45;
    p.scale = [0.5, 0.5];
    p.mult = Nickel.util.r_num(1,4);
    p.fill = [0, 255, 0, 1];
    p.color = [255, 255, 255, 0];
    if (Nickel.v2d.is_0(p.spd))
        p.dead = true; // kill static ptcs
});
TestSpray.add_updater(p => {
    //p.pos = Nickel.v2d.add(p.spd, p.pos);
    //p.rot += p.spd[0] / p.mult;
    p.scale = Nickel.v2d.add_s(Math.abs(p.spd[1])/(p.mult*100), p.scale);
    
    // stoplight colors : based on scale
    var change_speed = 9;
    if (p.scale[0] < 1) {
        p.fill[0] -= change_speed;
        p.fill[1] += change_speed;
        p.fill[2] -= change_speed;
    } else if (p.scale[0] < 2) {
        p.fill[0] += change_speed;
        p.fill[1] += change_speed;
        p.fill[2] -= change_speed;
    } else {
        p.fill[0] += change_speed;
        p.fill[1] -= change_speed;
        p.fill[2] -= change_speed;
    }

    // update glow color
    p._glow[1] = GlowPBS.hsla(p.fill);

    // fade away fill, fade in outline : based on time past
    //p.fill[3] -= 0.0015;
    //p.color[3] += 0.0015;

    if (p.scale[0] > 3)
        p.dead = true; // kill large ptcs
});

var TestBody = new Sprite(Game, DATA.IMG.DBG_THICK); // thick block 100x40
TestBody.bound = function(){};
var TestArm = new Sprite(Game, DATA.IMG.DBG_THIN);  // thin block   150x2
TestArm.bound = function(){};
var TestForearm = new Sprite(Game, DATA.IMG.DBG_THICK);  // thin block   150x2
TestForearm.bound = function(){};
var TestLimb = new Limb();
var TestLimbChild = new Limb(TestLimb);
var TestLimbGC = new Limb(TestLimbChild);
TestLimb.sprite = TestBody;
TestLimbChild.sprite = TestArm;
TestLimbGC.sprite = TestForearm;
TestBody.set_origin_centered();
TestBody.set_center(300, 300);
TestBody.set_pos(250,250);
TestBody.set_scale2(0.5, 0.5);
TestBody.set_rot(15);
TestArm.set_origin_centered();
//TestForearm.set_origin_centered();
TestLimbChild.offset_position = [50,0];
TestLimbChild.offset_rotation = 45;
TestLimbChild.offset_scale = [2,2]; // HERE: TODO: FIX: FOR SOME REASON THIS IS CAUSING PARENT SPRITE TO SCALE IN THE OPPOSITE DIRECTION
TestLimbChild.overlap = true;
TestLimbGC.offset_position = [75,1]; // right, center of arm
TestLimbGC.offset_rotation = -45;
TestLimbGC.offset_scale = [0.25, 0.25];
TestLimbGC.overlap = false;
var test_limbs = function(limb, spr) {
    for (let c of limb._limb_node.children) {
        var pjunk = /*c.obj.sprite.get_pos();*/c.obj.sprite.get_center();
        var pt = c.obj.get_body_pt([150,50]);
        var rev = c.obj.get_world_pt(pt); // should be 150,50
        //spr.set_center(pt[0], pt[1]); // 3 tiles right, 1 tile down
        c.obj.offset_rotation -= 2;
        for (let sub of c.children) {
            sub.obj.offset_rotation += 1;
        }
    }
    limb.sprite.rot += 1;
}

// testing limb stuff with NECRONS!!!
var spr_necron = new Sprite(Game, DATA.IMG.NECRON_UNIT);
var spr_rifle = new Sprite(Game, DATA.IMG.NECRON_GAUSS_RIFLE);
spr_necron.bound = function(){}
spr_rifle.bound = function(){}
spr_necron.set_origin([2,4]);
spr_rifle.set_origin([3,5]);
spr_necron.set_center(100,300);
spr_necron.set_scale2(4,4);
spr_rifle.set_scale2(4,4);
spr_necron.max_rot = 2;
spr_rifle.max_rot = 5;
var lmb_necron = new Limb();
var lmb_rifle = new Limb(lmb_necron);
var lmb_rh_rifle = new Limb();
Limb.attach(lmb_necron, lmb_rh_rifle);
lmb_necron.sprite = spr_necron;
lmb_rifle.sprite = spr_rifle;
lmb_rh_rifle.sprite = spr_rifle.copy_base();
lmb_rh_rifle.sprite.flip_v();
lmb_rh_rifle.sprite.set_origin([3,0]);
lmb_rh_rifle.sprite.set_scale2(4,4);
lmb_rh_rifle.sprite.max_rot = 5;
lmb_rifle.offset_position = [1,-4];
lmb_rifle.offset_rotation = 15;
lmb_rh_rifle.offset_position = [1,4];
lmb_rh_rifle.offset_rotation = -15;
lmb_rh_rifle.overlap = true;
lmb_rifle.overlap = true;
//lmb_necron.offset_scale = [2,2]; // no effect since no parent
//lmb_rifle.offset_scale = [2,2];
//lmb_rifle.unlock('rot');
//lmb_rh_rifle.unlock('rot');
var external_limb_bhvs = function(right, left) {
    
    var ms = Tilemap.get_mouse();
    right.sprite.turn_to(ms, false);

    var pt = Test.get_pos();
    left.sprite.turn_to(pt, false);
}

var lock_pos = true;
var lock_rot = true;
var lock_siz = true;
var control_limb_locks = function(main_limb, sub_limb) {
    // make main limb follow mouse and change size
    var ms = Tilemap.get_mouse();
    main_limb.sprite.turn_to(ms, false);
    var dist = Pathfinder.distance_to(main_limb.sprite.get_center(), ms);
    if (dist > 100) {
        main_limb.sprite.set_speed(0.5);
    } else {
        main_limb.sprite.set_speed(0);
    }
    if (dist > 200) {
        main_limb.sprite.set_scale(4 + (dist - 200) / 100);
    } else {
        main_limb.sprite.set_scale(4);
    }

    // if 1, lock/unlock limb pos
    //if (Game.key_downs[Nickel.KEYCODES.K_1]) {
    if (Game.key_upped == Nickel.KEYCODES.K_1) {
        if (lock_pos) {
            sub_limb.unlock('pos');
            lock_pos = false;
        } else {
            sub_limb.lock('pos', true);
            lock_pos = true;
        }
    }

    // if 2, lock/unlock limb rot
    //if (Game.key_downs[Nickel.KEYCODES.K_2]) {
    if (Game.key_upped == Nickel.KEYCODES.K_2) {
        if (lock_rot) {
            sub_limb.unlock('rot');
            lock_rot = false;
        } else {
            sub_limb.lock('rot', true);
            lock_rot = true;
        }
    }

    // if 3, lock/unlock limb siz
    //if (Game.key_downs[Nickel.KEYCODES.K_3]) {
    if (Game.key_upped == Nickel.KEYCODES.K_3) {
        if (lock_siz) {
            sub_limb.unlock('siz');
            lock_siz = false;
        } else {
            sub_limb.lock('siz', true);
            lock_siz = true;
        }
    }
}

// play background music
//DATA.SND.BG1.play();

// load all sprites into tilemap
Tilemap.load_sprite(Test);
Tilemap.load_sprite(TestLoco);
//Tilemap.load_sprite(TestSpray);
Tilemap.load_sprite(TestFire);
Tilemap.load_sprite(TestLimb);
Tilemap.load_sprite(lmb_necron);

// Tilemap functionalities
Tilemap.update_more = function() {

    // handle projectile event triggers
    Projectile.handle_triggers();
    StickyBullet.handle_triggers();

    // handle particle event triggers
    ParticleBulletSystem.handle_triggers();
    
    //junk
    reset_view_on_space();
    test_proj_on_akey();
    behave_with_mouse();
    //fire_to_mouse(TestFire);
    test_limbs(TestLimb, Test);
    external_limb_bhvs(lmb_rh_rifle, lmb_rifle);
    control_limb_locks(lmb_necron, lmb_rh_rifle);
}

// for debugging
var junk = false;

// for starting ont-time effects
var game_started = false;

// Game Loop:
Nickel.update = function() {

    // only update once all data is loaded
    if (!DATA.LOADED)
        return;
    else {
        if (!game_started) {
            game_started = true;
            DATA.SND.START.play();
        }
    }
    
    // Clear canvas
    Game.clear(); // if you don't clear it will be trippy mane

    // update Tilemap
    Tilemap.update();

    // garbage collection
    if (Projectile.count >= 25)
        SmartBullet.delete_destroyed(true);
    if (ParticleBulletSystem.particle_count >= 1000)
        ParticleBulletSystem.delete_destroyed(true);

    // TESTING JUNK
    if (junk) {
        var test_ms = new SimpleCircle(Game, 4);
        test_ms.stroke_color = 'red';
        test_ms.stroke_width = 8;
        test_ms.set_center(Tilemap.get_mouse());
        test_ms.update();
        var test_rect = new SimplePoly(Game, [
            Tilemap.rect.get_topleft(),
            Tilemap.rect.get_topright(),
            Tilemap.rect.get_bottomright(),
            Tilemap.rect.get_bottomleft()
        ]);
        test_rect.stroke_color = 'red';
        test_rect.stroke_width = 3;
        test_rect.update();
        var test_bbox = new SimplePoly(Game, [
            [Tilemap.rect.get_left(), Tilemap.rect.get_top()],
            [Tilemap.rect.get_right(), Tilemap.rect.get_top()],
            [Tilemap.rect.get_right(), Tilemap.rect.get_bottom()],
            [Tilemap.rect.get_left(), Tilemap.rect.get_bottom()]
        ]);
        test_bbox.stroke_color = 'purple';
        test_bbox.stroke_width = 3;
        test_bbox.update();
        if (DATA.GRID.limit_data) {
            var test_lims = new SimplePoly(Game, [
                [Tilemap.rect.get_left() - Tilemap.limits.pad_left,
                Tilemap.rect.get_top() - Tilemap.limits.pad_top],
                [Tilemap.rect.get_right() + Tilemap.limits.pad_right,
                Tilemap.rect.get_top() - Tilemap.limits.pad_top],
                [Tilemap.rect.get_right() + Tilemap.limits.pad_right,
                Tilemap.rect.get_bottom() + Tilemap.limits.pad_bottom],
                [Tilemap.rect.get_left() - Tilemap.limits.pad_left,
                Tilemap.rect.get_bottom() + Tilemap.limits.pad_bottom]
            ]);
            test_lims.stroke_color = 'blue';
            test_lims.stroke_width = 3;
            test_lims.update();
        }
        for (var g in Projectile._projectiles) {
            for (var i in Projectile._projectiles[g]) {
                var pgi = Projectile._projectiles[g][i];
                pgi.sprite.hull.shape.stroke_color = 'white';
                pgi.sprite.hull.shape.update();
            }
        }
        Test.hull.shape.stroke_color = 2;
        Test.hull.shape.stroke_color = 'red';
        Test.hull.shape.update();
    }

    // resets last key upped history
    Game.reset_key_upped();
}

// Start Game:
Game.run();