import {DATA} from "../scripts/data_loader.js";
import { Game } from "../scripts/game.js";

Game.set_fps(60); // 60 is best

DATA.SND.COIN.play();

var Tilemap = new Grid(DATA.GRID);


Nickel.update = function() {
   
    Game.clear();

    Tilemap.update();

}

Game.run();