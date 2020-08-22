////////////////////////////////////////////////////////////////////////////////
//
//  Author:         Ibrahim Sardar
//  Keywords:       Data Loader, JSON, Images, Sounds, Audio, Objects
//  Filename:       data_loader2.js
//  Date:           10/8/2019
//  Description:    game.js script dependant module to be included in main html
//                  file. Loads various types of data into the browser via
//                  external JSON for images, sounds, and objects.
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

export { DATA };

// JSON data list
var json_data = [null, null, null]

// Main data object
var DATA = {
    IMG : {}, // list of images
    SND : {}  // list of sounds
    // remaining objects will go straight into the data object
};

// Main data load indicators
DATA.IMG.LOADED = false; // all images loaded indicator
DATA.SND.LOADED = false; // all sounds loaded indicator
DATA.LOADED = false; // all data loaded indicator

// load all data from JSON files
{
    (function next(i=0) {
        var href = window.location.href;
        var dat = href.substring(0, href.lastIndexOf('/')) + "/";
        if (i == 0) dat = '../scripts/data/IMAGES.json';
        if (i == 1) dat = '../scripts/data/SOUNDS.json';
        if (i == 2) dat = '../scripts/data/OBJECTS.json';
        if (i >= 3) {
            console.log("JSON data files loaded.");
            set_data();
            load_imgs();
            load_snds();
            return;
        }

        // method #1
        // load json file from 'dat' variable
        fetch(dat)
            .then(
                rsp => rsp.json().then(
                    data => {
                        json_data[i] = data
                        next(++i);
                    }
                )
            )
        
        // method #2 ...not sure if this method works................
        //json_data[i] = fetch(dat)
        //    .then(rsp => rsp.json())
        //    .then(rsp => next(++i));
    }) ();
}

// set images, sounds, and objects from json to DATA variable
function set_data() {

    var imgs = json_data[0];
    var snds = json_data[1];
    var objs = json_data[2];

    for (var key in imgs)
        DATA.IMG[key] = imgs[key];
    for (var key in snds)
        DATA.SND[key] = new Howl(snds[key]);
}

// load all images
function load_imgs() {

    const IMAGES = Object.values(DATA.IMG);

    (function next(i=1) {
        if (i < IMAGES.length) {
            const img = new Image();
            img.addEventListener('load', function tmp() {
                next(++i);
                img.removeEventListener('load', tmp);
            });
            img.src = IMAGES[i].img;
        } else {
            console.log("Images loaded.");
            DATA.IMG.LOADED = true;
            if (DATA.SND.LOADED)
                load_objs();
        }
    }) ();
}

// load all sounds
function load_snds() {
    
    const SOUNDS = Object.values(DATA.SND);

    (function next(i=1) {
        if (i < SOUNDS.length) {
            if (SOUNDS[i].state() == 'loaded') next(++i);
            else SOUNDS[i].once('load', () => next(++i));
        } else {
            console.log("Sounds loaded.");
            DATA.SND.LOADED = true;
            if (DATA.IMG.LOADED)
                load_objs();
        }
    }) ();
}

// load all object files
function load_objs() {

    const OBJFILES = Object.values(json_data[2].files);

    // fix paths
    for (var i in OBJFILES)
        OBJFILES[i] = 'scripts/data/' + OBJFILES[i];

    (function next(i=0) {
        if (i < OBJFILES.length) {
            var script = document.createElement('script');
            script.addEventListener('load', function tmp() {
                next(++i);
                script.removeEventListener('load', tmp);
            });
            script.setAttribute("type","text/javascript");
            script.setAttribute('src', OBJFILES[i]);
            document.head.appendChild(script);
        } else
            console.log("Objects loaded.");
            DATA.LOADED = true;
    }) ();
}