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

import { Skeleton } from "../Skeleton.js";

export { GameManager, GameManager as GaMa }; // also export an alias

/**
 * @todo make user input simpler (keys/scroll?)
 * 
 * @class GameManager
 * 
 * Static class - holds/manages the current game details in addition
 * to the Nickel object and Viewport class.
 */
class GameManager {

    // Viewport of the game
    static scene;

    static init(scene) {

        GameManager.scene = scene;
        Skeleton._scene = scene;
    }

}//end class