////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Grid, Builder
//  Filename:       GridBuilder.js
//  Date:           4/14/2020
//  Description:    Builder class that helps simply creation of Nickel Grids.
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

export { UIBuilder };

/**
 * @class UIBuilder
 * 
 * Builder class that helps simple creation of Nickel UI elementss.
 */
class UIBuilder {

    static scene = null;
    static world = null;
    static default_step = null;
    static default_layer = null;
    static element_size_1 = [16,8];
    static element_size_2 = [32,16];
    static element_size_3 = [64,32];
    static element_size_4 = [128,64];
    static element_size_5 = [256,128];
    static element_size_6 = [512,256];
    static text_size_1 = 8;
    static text_size_2 = 12;
    static text_size_3 = 18;
    static text_size_4 = 32;
    static text_size_5 = 48;
    static text_size_6 = 72;
    static color_primary = 'black';
    static color_secondary = 'lightgray';
    static color_tertiary = 'red';
    static outline_thickness = 4;
    static font = 'Courier';
    static weight = 'normal';
    static valign = 'middle';

    static _resolve_element_size(size=0) {

        if (size == 1) return UIBuilder.element_size_1;
        if (size == 2) return UIBuilder.element_size_2;
        if (size == 3) return UIBuilder.element_size_3;
        if (size == 4) return UIBuilder.element_size_4;
        if (size == 5) return UIBuilder.element_size_5;
        if (size == 6) return UIBuilder.element_size_6;
        return [0,0];
    }

    static _resolve_text_size(size=0) {

        if (size == 1) return UIBuilder.text_size_1;
        if (size == 2) return UIBuilder.text_size_2;
        if (size == 3) return UIBuilder.text_size_3;
        if (size == 4) return UIBuilder.text_size_4;
        if (size == 5) return UIBuilder.text_size_5;
        if (size == 6) return UIBuilder.text_size_6;
        return 0;
    }

    static config(options={
        scene:UIBuilder.scene,
        world:UIBuilder.world,
        manager:null,
        default_step:null,
        default_layer:null,
        element_size_1:UIBuilder.element_size_1,
        element_size_2:UIBuilder.element_size_2,
        element_size_3:UIBuilder.element_size_3,
        element_size_4:UIBuilder.element_size_4,
        element_size_5:UIBuilder.element_size_5,
        element_size_6:UIBuilder.element_size_6,
        text_size_1:UIBuilder.text_size_1,
        text_size_2:UIBuilder.text_size_2,
        text_size_3:UIBuilder.text_size_3,
        text_size_4:UIBuilder.text_size_4,
        text_size_5:UIBuilder.text_size_5,
        text_size_6:UIBuilder.text_size_6,
        color_primary:UIBuilder.color_primary,
        color_secondary:UIBuilder.color_secondary,
        color_tertiary:UIBuilder.color_tertiary,
        outline_thickness:UIBuilder.outline_thickness,
        font:UIBuilder.font,
        weight:UIBuilder.weight,
        valign:UIBuilder.valign,
    }) {

        if (options.scene) UIBuilder.scene = options.scene;
        if (options.world) UIBuilder.world = options.world;
        if (options.manager) UIBuilder.world = options.manager.world;
        if (options.default_step && options.default_layer) {
            UIBuilder.default_step = options.default_step;
            UIBuilder.default_layer = options.default_layer;
        }
        if (options.element_size_1) UIBuilder.element_size_1 = options.element_size_1;
        if (options.element_size_2) UIBuilder.element_size_2 = options.element_size_2;
        if (options.element_size_3) UIBuilder.element_size_3 = options.element_size_3;
        if (options.element_size_4) UIBuilder.element_size_4 = options.element_size_4;
        if (options.element_size_5) UIBuilder.element_size_5 = options.element_size_5;
        if (options.element_size_6) UIBuilder.element_size_6 = options.element_size_6;
        if (options.text_size_1) UIBuilder.text_size_1 = options.text_size_1;
        if (options.text_size_2) UIBuilder.text_size_2 = options.text_size_2;
        if (options.text_size_3) UIBuilder.text_size_3 = options.text_size_3;
        if (options.text_size_4) UIBuilder.text_size_4 = options.text_size_4;
        if (options.text_size_5) UIBuilder.text_size_5 = options.text_size_5;
        if (options.text_size_6) UIBuilder.text_size_6 = options.text_size_6;
        if (options.color_primary) UIBuilder.color_primary = options.color_primary;
        if (options.color_secondary) UIBuilder.color_secondary = options.color_secondary;
        if (options.color_tertiary) UIBuilder.color_tertiary = options.color_tertiary;
        if (options.outline_thickness) UIBuilder.outline_thickness = options.outline_thickness;
        if (options.font) UIBuilder.font = options.font;
        if (options.weight) UIBuilder.weight = options.weight;
        if (options.valign) UIBuilder.valign = options.valign;
    }
    
    static text_button(options={}, _defaults={
        scene:UIBuilder.scene,
        replace:null, // must be null (no-replace) or an object built by UIBuilder
        position:[0,0],
        align:'center',
        size:4, // 1 to 6
        text_size:4, // 1 to 6
        text:'text-button',
        fill_color:UIBuilder.color_secondary,
        text_color:UIBuilder.color_primary,
        outline_color:UIBuilder.color_tertiary,
        outline_thickness:UIBuilder.outline_thickness,
        font:UIBuilder.font,
        weight:UIBuilder.weight,
        valign:UIBuilder.valign,
        step:UIBuilder.default_step,
        layer:UIBuilder.default_layer,
        with_game_loop:false // if true, will continuously reset text position to button position
    }) {

        if (options.replace && !options.replace._uib_world_index && options.replace._uib_world_index !== 0)
            return console.error('ERROR: UIBuilder>text_button: replacement was not built by the UIBuilder.');

        var esize = UIBuilder._resolve_element_size(options.size ?? _defaults.size);
        var tsize = UIBuilder._resolve_text_size(options.text_size ?? _defaults.text_size);
        var lbl = new SimpleText(
            options.scene ?? _defaults.scene,
            options.text ?? _defaults.text,
            options.font ?? _defaults.font,
            tsize,
            options.text_color ?? _defaults.text_color,
            options.position ?? _defaults.position,
            'center',
            options.weight ?? _defaults.weight,
            options.valign ?? _defaults.valign);
        var rectangle = new SimpleImage(
            options.scene ?? _defaults.scene,
            null,
            esize[0],
            esize[1],
            options.position ?? _defaults.position,
            options.fill_color ?? _defaults.fill_color,
            options.outline_color ?? _defaults.outline_color,
            options.outline_thickness ?? _defaults.outline_thickness);
        var btn = new SimpleButton(
            options.scene ?? _defaults.scene,
            rectangle,
            esize[0],
            esize[1],
            options.position ?? _defaults.position);
        btn.text = lbl;
        if (options.with_game_loop) {
            btn.text.center = btn.center;
            btn.update_more = () => {
                btn.text.center = btn.center;
                btn.text.update();
            }
        } else {
            btn.text.center = btn.center;
            btn.update_more = () => btn.text.update();
        }
        if (UIBuilder.world) {
            btn.mouse_func = (x,y) => UIBuilder.world.get_grid_point([x,y]);
            if (options.replace) {
                if (UIBuilder.world.has_render_stack) {
                    UIBuilder.world.renderer.obj.repl(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        options.replace._uib_world_index,
                        btn
                    );
                } else {
                    UIBuilder.world.load[options.replace._uib_world_index] = btn;
                }
                btn._uib_world_index = options.replace._uib_world_index;
            } else {
                if (UIBuilder.world.has_render_stack) {
                    btn._uib_world_index = UIBuilder.world.renderer.obj.add(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        btn
                    );
                } else {
                    UIBuilder.world.load_updater(btn);
                    btn._uib_world_index = UIBuilder.world.load.length - 1;
                }
            }
        }
        return btn;
    }

    static image_button(options={}, _defaults={
        scene:UIBuilder.scene,
        replace:null, // must be null (no-replace) or an object built by UIBuilder
        position:[0,0],
        align:'center',
        size:4,
        image_data:{img:null, w:0, h:0},
        text:'image-button',
        text_color:UIBuilder.color_primary,
        step:UIBuilder.default_step,
        layer:UIBuilder.default_layer,
    }) {

        if (options.replace && !options.replace._uib_world_index && options.replace._uib_world_index !== 0)
            return console.error('ERROR: UIBuilder>image_button: replacement was not built by the UIBuilder.');

        var esize = UIBuilder._resolve_element_size(options.size);
        var image = new SimpleImage(
            options.scene ?? _defaults.scene,
            options.image_data ? options.image_data.img : _defaults.image_data.img,
            options.image_data ? options.image_data.w : _defaults.image_data.w,
            options.image_data ? options.image_data.h : _defaults.image_data.h,
            options.position ?? _defaults.position);
        var btn = new SimpleButton(
            options.scene ?? _defaults.scene,
            image,
            esize[0],
            esize[1],
            options.position ?? _defaults.position);
        if (UIBuilder.world) {
            btn.mouse_func = (x,y) => UIBuilder.world.get_grid_point([x,y]);
            if (options.replace) {
                if (UIBuilder.world.has_render_stack) {
                    UIBuilder.world.renderer.obj.repl(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        options.replace._uib_world_index,
                        btn
                    );
                } else {
                    UIBuilder.world.load[options.replace._uib_world_index] = btn;
                }
                btn._uib_world_index = options.replace._uib_world_index;
            } else {
                if (UIBuilder.world.has_render_stack) {
                    btn._uib_world_index = UIBuilder.world.renderer.obj.add(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        btn
                    );
                } else {
                    UIBuilder.world.load_updater(btn);
                    btn._uib_world_index = UIBuilder.world.load.length - 1;
                }
            }
        }
        return btn;
    }

    static color_button(options={}, _defaults={
        scene:UIBuilder.scene,
        replace:null, // must be null (no-replace) or an object built by UIBuilder
        position:[0,0],
        align:'center',
        size:4,
        fill_color:UIBuilder.color_secondary,
        outline_color:UIBuilder.color_tertiary,
        outline_thickness:UIBuilder.outline_thickness,
        step:UIBuilder.default_step,
        layer:UIBuilder.default_layer,
    }) {
        
        if (options.replace && !options.replace._uib_world_index && options.replace._uib_world_index !== 0)
            return console.error('ERROR: UIBuilder>color_button: replacement was not built by the UIBuilder.');

        var esize = UIBuilder._resolve_element_size(options.size ?? _defaults.size);
        var rectangle = new SimpleImage(
            options.scene ?? _defaults.scene,
            null,
            esize[0],
            esize[1],
            options.position ?? _defaults.position,
            options.fill_color ?? _defaults.fill_color,
            options.outline_color ?? _defaults.outline_color,
            options.outline_thickness ?? _defaults.outline_thickness);
        var btn = new SimpleButton(
            options.scene ?? _defaults.scene,
            rectangle,
            esize[0],
            esize[1],
            options.position ?? _defaults.position);
        if (UIBuilder.world) {
            btn.mouse_func = (x,y) => UIBuilder.world.get_grid_point([x,y]);
            if (options.replace) {
                if (UIBuilder.world.has_render_stack) {
                    UIBuilder.world.renderer.obj.repl(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        options.replace._uib_world_index,
                        btn
                    );
                } else {
                    UIBuilder.world.load[options.replace._uib_world_index] = btn;
                }
                btn._uib_world_index = options.replace._uib_world_index;
            } else {
                if (UIBuilder.world.has_render_stack) {
                    btn._uib_world_index = UIBuilder.world.renderer.obj.add(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        btn
                    );
                } else {
                    UIBuilder.world.load_updater(btn);
                    btn._uib_world_index = UIBuilder.world.load.length - 1;
                }
            }
        }
        return btn;
    }

    static label(options={}, _defaults={
        scene:UIBuilder.scene,
        replace:null, // must be null (no-replace) or an object built by UIBuilder
        position:[0,0],
        text:'label',
        align:'center',
        text_size:4, // 1 to 6,
        text_color:UIBuilder.color_primary,
        font:UIBuilder.font,
        weight:UIBuilder.weight,
        valign:UIBuilder.valign,
        step:UIBuilder.default_step,
        layer:UIBuilder.default_layer,
    }) {
        if (options.replace && !options.replace._uib_world_index && options.replace._uib_world_index !== 0)
            return console.error('ERROR: UIBuilder>label: replacement was not built by the UIBuilder.');

        var tsize = UIBuilder._resolve_text_size(options.text_size ?? _defaults.text_size);
        var lbl = new SimpleText(
            options.scene ?? _defaults.scene,
            options.text ?? _defaults.text,
            options.font ?? _defaults.font,
            tsize,
            options.text_color ?? _defaults.text_color,
            options.position ?? _defaults.position,
            options.align ?? _defaults.align,
            options.weight ?? _defaults.weight,
            options.valign ?? _defaults.valign);
        if (UIBuilder.world) {
            if (options.replace) {
                if (UIBuilder.world.has_render_stack) {
                    UIBuilder.world.renderer.obj.repl(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        options.replace._uib_world_index,
                        lbl
                    );
                } else {
                    UIBuilder.world.load[options.replace._uib_world_index] = lbl;
                }
                lbl._uib_world_index = options.replace._uib_world_index;
            } else {
                if (UIBuilder.world.has_render_stack) {
                    lbl._uib_world_index = UIBuilder.world.renderer.obj.add(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        lbl
                    );
                } else {
                    UIBuilder.world.load_updater(lbl);
                    lbl._uib_world_index = UIBuilder.world.load.length - 1;
                }
            }
        }
        return lbl;
    }

    static grid(options={}, _defaults={
        scene:UIBuilder.scene,
        replace:null, // must be null (no-replace) or an object built by UIBuilder
        rows:10,
        cols:20,
        position:[0,0],
        width:200,
        height:100,
        back_color:UIBuilder.color_secondary,
        grid_color:UIBuilder.color_primary,
        border_color:UIBuilder.color_tertiary,
        grid_thickness:UIBuilder.outline_thickness,
        border_thickness:UIBuilder.outline_thickness,
        image:{img:null, w:0, h:0},
        step:UIBuilder.default_step,
        layer:UIBuilder.default_layer,
    }) {

        if (options.replace && !options.replace._uib_world_index && options.replace._uib_world_index !== 0)
            return console.error('ERROR: UIBuilder>grid: replacement was not built by the UIBuilder.');

        var img_or_not = options.image_data ? (options.image.img ? options.image : null) : null;
        var bg = new SimpleImage(
            options.scene ?? _defaults.scene,
            img_or_not,
            options.width ?? _defaults.width,
            options.height ?? _defaults.height,
            options.position ?? _defaults.position,
            options.back_color ?? _defaults.back_color,
            options.border_color ?? _defaults.border_color,
            options.border_thickness ?? _defaults.border_thickness);
        bg.lines = [];
        bg.update_more = () => {
            for (let line of bg.lines) line.update();
        }
        var off = [
            (options.position ? options.position[0] : _defaults.position[0]),
            (options.position ? options.position[1] : _defaults.position[1])
        ];
        var x_across = options.cols ?? _defaults.cols;
        var x_space = (options.width ?? _defaults.width) / x_across;
        for (var x=1; x<x_across; x++) {
            var line = new SimpleLine(
                options.scene ?? _defaults.scene,
                [x * x_space + off[0], off[1]],
                [x * x_space + off[0], off[1] + (options.height ?? _defaults.height)]);
            line.stroke_color = options.grid_color ?? _defaults.grid_color;
            line.stroke_width = options.grid_thickness ?? _defaults.grid_thickness;
            bg.lines.push(line);
        }
        var y_across = options.rows ?? _defaults.rows;
        var y_space = (options.height ?? _defaults.height) / y_across;
        for (var y=1; y<y_across; y++) {
            var line = new SimpleLine(
                options.scene ?? _defaults.scene,
                [off[0], off[1] + y * y_space],
                [off[0] + (options.width ?? _defaults.width), off[1] + y * y_space]);
            line.stroke_color = options.grid_color ?? _defaults.grid_color;
            line.stroke_width = options.grid_thickness ?? _defaults.grid_thickness;
            bg.lines.push(line);
        }
        if (UIBuilder.world) {
            if (options.replace) {
                if (UIBuilder.world.has_render_stack) {
                    UIBuilder.world.renderer.obj.repl(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        options.replace._uib_world_index,
                        bg
                    );
                } else {
                    UIBuilder.world.load[options.replace._uib_world_index] = bg;
                }
                bg._uib_world_index = options.replace._uib_world_index;
            } else {
                if (UIBuilder.world.has_render_stack) {
                    bg._uib_world_index = UIBuilder.world.renderer.obj.add(
                        options.step ?? _defaults.step,
                        options.layer ?? _defaults.layer,
                        bg
                    );
                } else {
                    UIBuilder.world.load_updater(bg);
                    bg._uib_world_index = UIBuilder.world.load.length - 1;
                }
            }
        }
        return bg;
    }
}//end UIBuilder