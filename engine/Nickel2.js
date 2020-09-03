/*
    NAME:   "Nickel2.js"
    AUTH:   Ibrahim Sardar
    DESC:   A major update from Nickel.js.
    NOTE:   Does not require simpleGame.js anymore.
*/



// --
// ------- GLOBAL OBJECTS ------------------------------------
// --



////////////////////////////////////////////
///   GRID   ///////////////////////////////
////////////////////////////////////////////
function Grid(grid_data) {

    GridBuilder.create_grid(this, grid_data);
    GridBuilder.build_specializations(this);
}



////////////////////////////////////////////
///   TILE   ///////////////////////////////
////////////////////////////////////////////
function Tile(tile_data) {

    var tile = TileBuilder.create_tile(tile_data);
    return tile;
}



////////////////////////////////////////////
///   NAVNODE   ////////////////////////////
////////////////////////////////////////////
function NavNode(node_data) {

    NavNodeBuilder.create_node(this, node_data);
    NavNodeBuilder.build_specializations(this);
}



////////////////////////////////////////////
///   LOCOMOTIVE   /////////////////////////
////////////////////////////////////////////
function Locomotive(loco_data) {

    var locomotive = LocomotiveBuilder.create_locomotive(loco_data);
    LocomotiveBuilder.create_steering_behaviours(locomotive);
    return locomotive;
}



////////////////////////////////////////////
///   PARTICLE   ///////////////////////////
////////////////////////////////////////////
function Particle(particle_data, system) {
    // up to 6 decimal places for variation variables allowed

    ParticleBuilder.create_base(this, system, particle_data);
}



////////////////////////////////////////////
///   PARTICLE SYSTEM   ////////////////////
////////////////////////////////////////////
function ParticleSystem(system_data) {

    ParticleSystemBuilder.create(this, system_data);
}



// --
// ------- UTILITY OBJECTS -----------------------------------
// --



////////////////////////////////////////////
///   PATHFINDER   /////////////////////////
////////////////////////////////////////////
var Pathfinder = {

    //
    //  private functions
    //
    _explore            : function (dict, pt) {
        if (!dict[pt[0]]) {
            dict[pt[0]] = {};
        }
        dict[pt[0]][pt[1]] = true;
    },

    _explored           : function (dict, pt) {
        try {
            if (dict[pt[0]][pt[1]])
                return true;
        } catch(e) {}
        return false;
    },

    _compare            : function (pta, ptb) {
        if (pta[0] == ptb[0])
            if (pta[1] == ptb[1])
                return true;
        return false;
    },

    //
    //  public functions
    //
    distance_to         : function(p0, p1) {
        var run  = p0[0] - p1[0];
        var rise = p0[1] - p1[1];
        return Math.sqrt(rise*rise + run*run);
    }

    ,

    distance_to_squared : function(p0, p1) {
        var run  = p0[0] - p1[0];
        var rise = p0[1] - p1[1];
        return rise*rise + run*run;
    }

    ,

    direction_to        : function(p0, p1, degs=true) {
        return Nickel.util.atan2(
            p0[1] - p1[1],
            p1[0] - p0[0]
        ) * (!degs || (180 / Math.PI));
    }

    ,

    // TODO: get accurate vertices for shapes as well
    // TODO: add option for vertices to not be compartmentalized
    get_vertices        : function(items) {
        // returns a 2D list:
        //    items[ item1[edge1,edge2...], item2[...], ... ]
        //
        // input must be a list of sprites/shapes (list of edge points)

        var objs = [];
        for (var i in items) {
            var vertices = [];
            var obj = items[i];
            if (Nickel.UTILITY.is_array(obj)) {
                vertices = obj;
            } else {
                vertices.push(obj.get_topleft());
                vertices.push(obj.get_topright());
                vertices.push(obj.get_bottomright());
                vertices.push(obj.get_bottomleft());
            }
            objs.push(vertices);
        }

        return objs;
    }

    ,

    // TODO: DELETE THIS CAREFULLY
    /**
     * @deprecated since 2017
     * use "is_in_los2" instead
     */
    is_in_los           : function(host,source,target,obstructions,avoid_collisions=false,offset_size=null) {
        //
        // returns true if target is in line of sight of sprite
        // false if not
        //
        // offset_size: rayblock size=[width + offset[1], height + offset[0]]
        //

        // change source to be an array if we don't care about collisions
        if (!avoid_collisions) {
            source = [source.get_cx(), source.get_cy()];
        }

        // obtain target
        var t = [0,0,0,0];
        if (Nickel.UTILITY.is_array(target)) {
            // x,y position
            t[0] = target[0];
            t[1] = target[1];
            // center position
            t[2] = t[0];
            t[3] = t[1];
        } else {
            // x,y position
            t[0] = target.get_x();
            t[1] = target.get_y();
            // center position
            t[2] = target.get_cx();
            t[3] = target.get_cy();
        }

        // obtain source with position, dimension, center points, and center origin
        var s = [0,0,0,0,0,0,0,0];
        if (Nickel.UTILITY.is_array(source)) {
            // x,y position
            s[0] = source[0];
            s[1] = source[1];
            // width, height (behave like a line)
            s[2] = 0;
            s[3] = 2;
            // center postion
            s[4] = s[0];
            s[5] = s[1];
            // center origin
            s[6] = 0;
            s[7] = 0;
        } else {
            // x,y position
            s[0] = source.get_x();
            s[1] = source.get_y();
            // width, height
            s[2] = source.get_w();
            s[3] = source.get_h();
            // center postion
            s[4] = source.get_cx();
            s[5] = source.get_cy();
            // center origin
            s[6] = s[2]/2;
            s[7] = s[3]/2;
        }

        // determine distance (width of ray block)
        var xdiff = s[4] - t[2];
        var ydiff = s[5] - t[3];
        var width = Math.sqrt((xdiff * xdiff) + (ydiff * ydiff)) + s[2];

        // determine height of ray block
        var height = s[3];

        // determine angle of ray block from center points
        var theta = Math.atan2(s[5]-t[3], t[2]-s[4]) * 180 / Math.PI;

        // create and update ray block
        var rayblock = new Sprite(host, {w:22, h:10});
        rayblock.set_size(width,height);
        rayblock.set_origin([s[6],s[7]]);
        rayblock.set_pos2(s[4],s[5]);
        rayblock.set_rot(theta);
        rayblock.update();

        // apply offset, if any
        if (offset_size) {
            var rc = rayblock.get_center();
            console.log(rc);
            rayblock.set_size(width+offset_size[1],height+offset_size[0]);
            rayblock.update();
            rayblock.set_center(rc[0],rc[1]);
        }

        // determine line of sight successful
        for (var i in obstructions) {
            var wall = obstructions[i];
            if (wall.colliding_with(rayblock, false)) {
                return false;
            }
        }

        return true;
    }

    ,

    // TODO: OPTIMIZE TYPE CHECKING, OPTIMIZE LOOP, RENAME TO is_in_los CAREFULLY (AFTER DELETING ORIGINAL is_in_los)
    is_in_los2          : function(start,end,obstructions) {
        //--    returns true if there is nothing blocking
        //--    the view from start to end
        //--

        // lineseg from start to end points
        var line = new LineSegment(start, end);

        // check collision of lineseg with every obstruction
        for (var i in obstructions) {
            if (Nickel.UTILITY.is_array(obstructions[i])) {
                if (Collision_Detector.collides_line_point(line, obstructions[i])) return false;

            } else if (obstructions[i].type == "Sprite") {
                if (obstructions[i].colliding_with(line, false)) return false;

            } else if (obstructions[i].type == "SimplePoly") {
                if (Collision_Detector.collides_poly_line(obstructions[i], line)) return false;

            } else if (obstructions[i].type == "SimpleCircle") {
                if (Collision_Detector.collides_circle_line(obstructions[i], line)) return false;

            } else if (obstructions[i].type == "SimpleLine") {
                if (Collision_Detector.collides_line_line(line, obstructions[i])) return false;
            }
        }

        // no obstructions are blocking the view!
        return true;
    }

    ,

    adjacent_to_point   : function(pos,incl_diag=true) {
        // returns adjacent positions in clockwise direction,
        // starting from the right.

        adjs = [];

        // E
        adjs.push( [pos[0]+1,pos[1]] );
        // SE
        if (incl_diag) adjs.push( [pos[0]+1,pos[1]+1] );
        // S
        adjs.push( [pos[0],pos[1]+1] );
        // SW
        if (incl_diag) adjs.push( [pos[0]-1,pos[1]+1] );
        // W
        adjs.push( [pos[0]-1,pos[1]] );
        // NW
        if (incl_diag) adjs.push( [pos[0]-1,pos[1]-1] );
        // N
        adjs.push( [pos[0],pos[1]-1] );
        // NE
        if (incl_diag) adjs.push( [pos[0]+1,pos[1]-1] );

        return adjs;
    }

    ,

    adjacents           : function(pos,lim_e,lim_n,lim_w,lim_s,incl_diag=true) {
        // returns valid adjacents
        // (clockwise direction starting from right)

        var adjs = Pathfinder.adjacent_to_point(pos,incl_diag);
        var new_adjs = [];
        for (var i=0; i<8; i++) {
            if (adjs[i][0] <= lim_e &&
                adjs[i][0] >= lim_w &&
                adjs[i][1] <= lim_s &&
                adjs[i][1] >= lim_n) {
                new_adjs.push(adjs[i]);
            }
        }
        return new_adjs;
    }

    ,

    // TODO: COMPLETE THIS
    adjacent_neighbors  : function(nav,from_positions,guess_outer=true,start_angle=0,out_heap=0,center_coord=null,limit=1000) {
        //  Returns list of neighbor coordinates adjacent to the specified coordinates
        //  Uses the Moore-Neighborhood Tracing Algorithm
        //  out_heap Code:
        //    0 :   false
        //    1 :   min heap
        //    2 :   max heap
        //

        // helpers
        function same_as(a,b) {
            return a[0]==b[0] && a[1]==b[1] ? true : false;
        }

        function exists_in(point, list) {
            var len = list.length;
            for (var i=0; i<len; i++) {
                if (point[0] == list[i][0] &&
                    point[1] == list[i][1]) {
                    return true;
                }
            }
            return false;
        }

        function is_in_range(point) {
            if (point[0] >= 0     &&
                point[0] <  nav.w &&
                point[1] >= 0     &&
                point[1] <  nav.h ) {
                return true
            }
            return false;
        }

        function nbor_at(pivot,angle) {

            // get cooresponding coordinate
            switch(angle) {
                case 0:
                    return [pivot[0]+1,pivot[1]  ];
                case 45:
                    return [pivot[0]+1,pivot[1]-1];
                case 90:
                    return [pivot[0],  pivot[1]-1];
                case 135:
                    return [pivot[0]-1,pivot[1]-1];
                case 180:
                    return [pivot[0]-1,pivot[1]  ];
                case 225:
                    return [pivot[0]-1,pivot[1]+1];
                case 270:
                    return [pivot[0]  ,pivot[1]+1];
                case 315:
                    return [pivot[0]+1,pivot[1]+1];
            }

            // error
            return -1;
        }

        function is_diagonal(angle) {
            switch(angle) {
                case 0:
                case 90:
                case 180:
                case 270:
                    return false;
                default:
                    return true;
            }
        }

        // variables
        var count = 0;
        var nbors = [];
        var start = [-1,-1];
        var curr  = [0,0];
        var prev  = [0,0];
        var angle = start_angle;
        var start_visits = 1;

        // init heap if any
        if (out_heap==1) {
            var heap = new Heap('min');
        } else if (out_heap==2) {
            var heap = new Heap('max');
        }

        // if returning a heap
        if (out_heap) {

            // if center is not set
            if (center_coord == null) {

                // get avg center of tiles
                var avgx = 0;
                var avgy = 0;
                for (var i in from_positions) {
                    avgx += nav.at(from_positions[i]).x;
                    avgy += nav.at(from_positions[i]).y;
                }
                center_coord = [avgx / from_positions.length,
                                avgy / from_positions.length];
            }
        }

        // init
        curr[0] = from_positions[0][0];
        curr[1] = from_positions[0][1];

        // guess the "outer" area of the given structure
        // (keep going right until we hit an empty space)
        if (guess_outer) {
            curr[0]++;
            while(exists_in(curr, from_positions)) {
                curr[0]++;
            }
            curr[0]--;
        }

        // don't guess outer; user specifies outer via angle from [[0,0]]
        else {

            angle = start_angle;
        }

        // remember start coordinate
        start[0] = curr[0];
        start[1] = curr[1];

        // rotate around from_positions until we reach starting pos
        while(true){

            // error handle
            if (count >= limit) {return 'ERROR';}
            count++;

            // clean angle
            angle = Nickel.UTILITY.trim_angle(angle);

            // get neighbor coordinate
            var tmp_nbor = nbor_at(curr,angle);

            console.log('current: '+curr+', angle: '+angle+', neighbor: '+tmp_nbor);
            console.log('START: '+start);

            // if current tile is start tile
            if (same_as(curr,start)) {
                console.log('current is start');

                // if current angle same as start angle
                if (angle == start_angle) {

                    // if start was visited at least twice
                    if (start_visits > 1) {
                        console.log('start has been visited again, we are done.');

                        // all neighbors have been found
                        console.log(nbors);
                        if (!out_heap) {
                            return nbors;
                        } else {
                            return heap;
                        }
                    }

                    // if start is the only source
                    //   visit self once more so next time we visit, we are finished
                    if (from_positions.length == 1) {
                        start_visits++;
                    }
                }
            }

            // if neighbor is out of bounds
            if (!is_in_range(tmp_nbor)) {
                console.log('nbor is out of bounds');

                // skip it, go to next
                angle += 45;
                continue;
            }

            // get neighbor coordinate's tile
            var tmp_tile = nav.at(tmp_nbor);

            // if neighbor tile is blocked
            if (tmp_tile.blocked) {
                console.log('nbor is blocked');

                // skip it, go to next
                angle += 45;
                continue;
            }

            // if neighbor tile is the start tile
            if (same_as(tmp_nbor,start)) {
                console.log('neighbor is start');

                // curr becomes start
                curr[0] = start[0];
                curr[1] = start[1];

                // flip current angle to continue from start
                angle += 180;

                // increment angle at least once to skip where we just were
                angle += 45;

                // increment start tile visits
                start_visits++;

                // go to next
                continue;
            }

            // if neighbor tile is a source tile (other than start)
            if (exists_in(tmp_nbor,from_positions)) {
                console.log('neighbor is source; not start');

                // curr becomes neighbor
                curr[0] = tmp_nbor[0];
                curr[1] = tmp_nbor[1];

                // flip current angle to continue from start
                angle += 180;

                // increment angle at least once to skip where we just were
                angle += 45;

                // go to next
                continue;
            }

            // if neighbor tile has already been added
            if (exists_in(tmp_nbor,nbors)) {

                // skip it, go to next
                angle += 45;
                continue;
            }



            // if neighbor tile is empty:

            // if outputs a heap
            if (out_heap) {

                // order by distance from avg center coordinate
                var dist = Pathfinder.distance_to(center_coord,tmp_tile.pos());
                heap.in(tmp_nbor,dist);
            }

            // add it as a neighbor
            nbors.push(tmp_nbor);

            // go to next
            angle += 45;
            console.log('neighbor is empty');
        }

        // HERE
    }

    ,

    nearest_neighbor    : function(grid,from_positions,center_coordinate=null) {
        //  Returns the nearest neighbor coordinate
        //  center default is ang coordinate of from_positions
        //

        return Pathfinder.adjacent_neighbors(grid.nav, from_positions, true, 0, 1, center_coordinate).out().obj;
    }

    ,

    furthest_neighbor   : function(grid,from_positions,center_coordinate=null) {
        //  Returns the furthest neighbor coordinate
        //  center default is ang coordinate of from_positions
        //

        return Pathfinder.adjacent_neighbors(grid.nav, from_positions, true, 0, 2, center_coordinate).out().obj;
    }

    ,

    bordering_neighbors : function(grid,from_positions) {
        //  Returns a list of neighborring sprites
        //

        return Pathfinder.adjacent_neighbors(grid.nav, from_positions);
    }

    ,

    dijkstra : function(nav,a,b,lim_e,lim_n,lim_w,lim_s,incl_diag=true,limit=333333) {

        // edge case
        if (a[0]==b[0] && a[1]==b[1]) return [];

        var exp = {};
        var adjs = [];
        var H = new Heap('min');
        var curr = a;
        var cnt = 0;
        var tmpcost = 0;
        var tmpnext = null;
        var tmpcurr = null;

        nav.apply_to_all(function(n){
            n.G = 9999;
            n.P = null;
        });

        nav.at(curr).G = 0;

        // set parents
        while(true){

            tmpcurr = nav.at(curr);
            adjs = Pathfinder.adjacents(curr, lim_e, lim_n, lim_w, lim_s, incl_diag);

            if(cnt>limit){break;}
            cnt++;

            Pathfinder._explore(exp, curr);

            for (var i=0, len=adjs.length; i<len; i++) {

                if (!Pathfinder._explored(exp, adjs[i])) {

                    tmpnext = nav.at(adjs[i]);
                    if (!tmpnext.blocked) {

                        tmpcost = tmpcurr.G + Pathfinder.distance_to(curr, adjs[i]);
                        if (tmpcost < tmpnext.G) {

                            tmpnext.G = tmpcost;
                            tmpnext.P = tmpcurr;

                            // also tweak node if it is in the frontier:
                            if (!H.tweak(adjs[i], tmpnext.G, Pathfinder._compare)) {

                                // ...else, add it to the frontier:
                                H.in(adjs[i], tmpnext.G);
                            }
                        }
                    }
                }
            }

            var curr_is_available = false;
            while(!H.is_empty()) {

                curr = H.out().obj;

                if (!Pathfinder._explored(curr)) {curr_is_available=true; break;}
            }

            if (!curr_is_available && H.is_empty()) break;

            if (curr[0]==b[0] && curr[1]==b[1]) break;
        }

        // get path
        var par = null;
        var S = new Stack();

        curr = nav.at(b);
        S.push(curr);

        while(true) {

            if(cnt>limit){break;}
            cnt++;

            par = curr.P;

            if (!par) break;

            S.push(par);
            curr = par;
        }

        // return node path
        if (cnt <= limit) { return S.dump(); }
        else return [];
    }

    ,

    a_star : function(nav,a,b,lim_e,lim_n,lim_w,lim_s,incl_diag=true,limit=333333) {

        // edge case
        if (a[0]==b[0] && a[1]==b[1]) return [];

        var exp = {};
        var front = {};
        var adjs = [];
        var H = new Heap('min');
        var curr = a;
        var cnt = 0;
        var tmpcost = 0;
        var tmphuer = 0;
        var tmpnext = null;
        var tmpcurr = null;

        nav.apply_to_all(function(n){
            n.G = 0;
            n.H = 9999;
            n.P = null;
        });

        nav.at(curr).G = 0;

        // set parents
        while(true){

            tmpcurr = nav.at(curr);
            adjs = Pathfinder.adjacents(curr, lim_e, lim_n, lim_w, lim_s, incl_diag);

            if(cnt>limit){break;}
            cnt++;

            Pathfinder._explore(exp, curr);

            for (var i=0, len=adjs.length; i<len; i++) {

                if (!Pathfinder._explored(exp, adjs[i])) {

                    tmpnext = nav.at(adjs[i]);
                    if (!tmpnext.blocked) {

                        tmpcost = tmpcurr.G + Pathfinder.distance_to(curr, adjs[i]);
                        tmphuer = Pathfinder.distance_to(adjs[i], b);
                        if ((tmpcost + tmphuer) < (tmpnext.G + tmpnext.H)) {

                            tmpnext.G = tmpcost;
                            tmpnext.H = tmphuer;
                            tmpnext.P = tmpcurr;

                            // also tweak node if it is in the frontier:
                            if (!H.tweak(adjs[i], (tmpcost + tmphuer), Pathfinder._compare)) {

                                // ...else, add it to the frontier:
                                H.in(adjs[i], (tmpcost + tmphuer));
                            }
                        }
                    }
                }
            }

            var curr_is_available = false;
            while(!H.is_empty()) {

                curr = H.out().obj;

                if (!Pathfinder._explored(curr)) {curr_is_available=true; break;}
            }

            if (!curr_is_available && H.is_empty()) {console.log("No Path Found"); break};

            if (curr[0]==b[0] && curr[1]==b[1]) break;
        }



        // get path
        var par = null;
        var S = new Stack();

        curr = nav.at(b);
        S.push(curr);

        while(true) {

            if(cnt>limit){break;}
            cnt++;

            par = curr.P;

            if (!par) break;

            S.push(par);
            curr = par;
        }

        // return node path
        if (cnt <= limit) { return S.dump(); }
        else return [];
    }

    ,

    theta_star : function(map, a, b, lim_e, lim_n, lim_w, lim_s,
                            obstructions=[], incl_diag=true, limit=333333) {

        // edge case: start & end are at same tile
        if (a[0]==b[0] && a[1]==b[1]) return [];

        // vars
        var exp = {};
        var adjs = [];
        var H = new Heap('min');
        var nav = map.nav;
        var curr = a;
        var cnt = 0;
        var tmpcost = 0;
        var tmphuer = 0;
        var tmpnext = null;
        var tmpcurr = null;
        var tilnext = null;
        var tilcurp = null;
        var tilcurr = null;

        // reset hueristic & parent values for each node
        nav.apply_to_all(function(n) {
            n.G = 0;
            n.H = 9999;
            n.P = null;
        });

        // set parents of necessary nodes
        while(true) {

            // limit path finding in case of impossible path
            if(cnt > limit)
                break;
            cnt++;

            // explore current position
            Pathfinder._explore(exp, curr);

            // get adjacent positions
            adjs = Pathfinder.adjacents(curr, lim_e, lim_n, lim_w, lim_s, incl_diag);

            // update properties for each adjacent node
            for (var i=0, len=adjs.length; i<len; i++) {

                // if ajdacent position is not explored
                if (!Pathfinder._explored(exp, adjs[i])) {

                    // get nav nodes of curr and next
                    tmpcurr = nav.at(curr);
                    tmpnext = nav.at(adjs[i]);

                    // if adjacent node is not blocked
                    if (!tmpnext.blocked) {

                        // get tiles of curr and next nodes
                        tilcurr = map.get_tile(tmpcurr.pos());
                        tilnext = map.get_tile(tmpnext.pos());

                        // can curr see adjacent?
                        // (this is an expensive way to check if an
                        //  adjacent tile is reachable without hitting
                        //  a corner of some other neighboring wall)
                        var adj_in_sight = Pathfinder.is_in_los2(
                            tilnext.get_center(),
                            tilcurr.get_center(),
                            obstructions);

                        // if adjacent tile is in sight, check if
                        // adjacent is reachable from curr tile
                        if (adj_in_sight) {

                            // calculate travelled (G) and to-travel costs (H)
                            // note: the square roots are expensive operations,
                            //       a faster way would be to use the formulas:
                            //
                            //          G = is_diagonal(adjs[i]) ? sqrt(2) : 1;
                            //          H = max(dx, dy) + sqrt(2) * min(dx, dy)
                            //
                            tmpcost = tmpcurr.G + Pathfinder.distance_to(curr, adjs[i]);
                            tmphuer = Pathfinder.distance_to(adjs[i], b);

                            // update costs and parents resulting in the
                            // determination of the next optimal tile
                            var curr_recorded_cost = tmpcost + tmphuer;
                            var next_recorded_cost = tmpnext.G + tmpnext.H;
                            if (curr_recorded_cost < next_recorded_cost) {

                                // record new, better cost
                                tmpnext.G = tmpcost;
                                tmpnext.H = tmphuer;

                                // get tile of current's parent
                                if (tmpcurr.P)
                                    tilcurp = map.get_tile(tmpcurr.P.pos());

                                // if current's parent exists
                                if (tmpcurr.P) {

                                    // get line of sight between the next and the previous tiles
                                    var los = Pathfinder.is_in_los2(
                                        tilnext.get_center(),
                                        tilcurp.get_center(),
                                        obstructions);

                                    // if the line of sight is not obstructed,
                                    // set current's parent as next's parent
                                    if (los)
                                        tmpnext.P = tmpcurr.P;
                                    
                                    // if the line of sight was obstructed,
                                    // set current as parent to next
                                    else
                                        tmpnext.P = tmpcurr;

                                }

                                // if current's parent does not exist,
                                // set current as parent to next
                                else
                                    tmpnext.P = tmpcurr;

                                // check if node is in frontier heap by attempting
                                // to update node's priority in heap
                                if (!H.tweak(adjs[i], (tmpcost + tmphuer), Pathfinder._compare)) {

                                    // if not found in heap, add it to the frontier heap:
                                    H.in(adjs[i], (tmpcost + tmphuer));
                                }
                            }
                        }
                    }
                }
            }

            // search for unexplored frontier nodes to explore.
            // (whatever position curr is set to will be explored
            //  in the start of the encompassing while loop)
            var unexplored_frontier_found = false;
            while(!H.is_empty()) {
                curr = H.out().obj;
                if (!Pathfinder._explored(curr)) {
                    unexplored_frontier_found=true;
                    break;
                }
            }

            // if no more frontier is left to explore
            // and there is no other possible route,
            // path cannot be determined.
            if (!unexplored_frontier_found && H.is_empty()) {
                console.log("No Path Found");
                break;
            };

            // end of path reached
            if (curr[0]==b[0] && curr[1]==b[1])
                break;
        }

        // vars
        var par = null;
        var S = new Stack();

        // start at the finishing node
        curr = nav.at(b);

        // push to path stack
        // (last position in final path)
        S.push(curr);

        // get path
        while(true) {

            // limit path tracing in case of impossible path
            if(cnt > limit)
                break;
            cnt++;

            // backtrack via parent
            par = curr.P;

            // if no parent, start node reached
            if (!par)
                break;

            // push to path stack
            S.push(par);

            // bactrack curr to parent
            curr = par;
        }

        // if limit not exceded,
        // return path (path found)
        if (cnt <= limit)
            return S.dump();
        
        // if limit exceded,
        // return empty path (no path found)
        else
            return [];
    }

    ,

    // TODO
    find_path_to        : function(grid,unit,dest) {
        // Use an arbitrary algorithm along with navnode info
        //   to generate best path to goal.
        //

        // something like this
        //var node1 = { tile:grid[0][1], xoff:12, yoff:-8 };
        //var node2 = { tile:grid[0][0], xoff:-10, yoff:30 };
        //var node3 = { tile:grid[1][0], xoff:0, yoff:0 };
        //return [ node1, node2, node3 ];

        return [];
    }

    ,

    // TODO
    find_path_near      : function(grid,unit,dest) {
        // ...

    }

    ,

    // TODO
    find_path_around    : function(grid,unit,dest) {
        // ...

    }

}



// --
// ------- DESIGN PATTERN OBJECTS ----------------------------
// --



////////////////////////////////////////////
///   GRID BUILDER   ///////////////////////
////////////////////////////////////////////
var GridBuilder = {

    create_grid : function(grid, grid_data) {

        // extract private data
        var matrix  = grid_data.matrix;
        var types   = grid_data.types;
        var bg_data = grid_data.bg_data;

        // extract public data
        grid.scene = grid_data.scene;
        grid.tdata = grid_data.scroll_data;
        grid.rdata = grid_data.rotation_data;
        grid.sdata = grid_data.zoom_data;
        grid.limits_orig = grid_data.limit_data;
        grid.ndata = grid_data.navmesh_data;

        // copy limits
        if (grid.limits_orig)
            grid.limits = Object.assign({}, grid.limits_orig);

        // background
        if (bg_data) {
            grid.bg = new Sprite(grid.scene, bg_data, false, null, false);
            grid.bg.bound = function() {};
            grid.bg.set_pos(0,0);
        }

        // tiled map
        if (matrix && matrix[0]) {

            grid.map = [];
            for (var x in matrix[0]) {

                grid.map.push([]);
                for (var y in matrix) {

                    var tile = new Tile( types[matrix[y][x]] );
                    tile.set_pos( tile.get_w()*x, tile.get_h()*y );
                    grid.map[x].push(tile);
                }
            }

            //tiles
            grid.tiles_south = matrix.length;
            grid.tiles_east = matrix[0].length;

            //dimensions
            grid.width = 0;
            grid.height = 0;
            for (var x=0 ; x<grid.tiles_east ; x++) {
                grid.width += grid.map[x][0].get_w();
            }
            for (var y=0 ; y<grid.tiles_south ; y++) {
                grid.height += grid.map[0][y].get_h();
            }
            if (grid.bg && grid.width < grid.bg.get_w()) grid.width = grid.bg.get_w();
            if (grid.bg && grid.height < grid.bg.get_h()) grid.height = grid.bg.get_h();
        } else {
            
            grid.map = [];
            grid.tiles_south = 0;
            grid.tiles_east = 0;
            grid.width = grid.bg.get_w();
            grid.height = grid.bg.get_h();
        }

        // rect
        grid.rect = new Sprite(grid.scene, {w: grid.width, h: grid.height}, true, null, false);
        grid.rect.bound = function() {};
        grid.rect.set_pos(0,0);

        // storage (holds sprites to be updated with the grid)
        grid.load = [];

        // holds list of control functions
        grid.controls = [];

        // for efficient grid transformations
        var pre_grid_canvas = null;

        // 2D transformation matrices
        grid.transform = {
            x  : 0,  y : 0, // translation
            sx : 1, sy : 1, // scale
            ang : 0         // rotation (degs)
        }

        // rotation and scaling origins
        grid.rot_origin = [0, 0];
        grid.scale_origin = [0, 0];

        // set mouse at center of screen at initialization
        grid.scene.mouse_x = grid.scene.get_w() / 2;
        grid.scene.mouse_y = grid.scene.get_h() / 2;

        // getters
        grid.get_mouse = function() {

            // return mouse position transformed to grid
            return grid.get_grid_point([grid.scene.mouse_x, grid.scene.mouse_y]);
        }
        grid.get_canvas_point = function(grid_pt) {

            // create new var to not disturb input value
            var canvas_pt = [grid_pt[0], grid_pt[1]];

            // rotation vars
            var rad = grid.transform.ang * Math.PI / 180 * -1;
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);
            var tmp_origin_rot = [grid.rot_origin[0], grid.rot_origin[1]];

            // scaling vars
            var tmp_origin = [grid.scale_origin[0], grid.scale_origin[1]];

            // offset translate
            canvas_pt[0] += grid.transform.x;
            canvas_pt[1] += grid.transform.y;

            tmp_origin_rot[0] += grid.transform.x;
            tmp_origin_rot[1] += grid.transform.y;

            tmp_origin[0] += grid.transform.x;
            tmp_origin[1] += grid.transform.y;
            
            // offset rotate
            canvas_pt[0] -= tmp_origin_rot[0];
            canvas_pt[1] -= tmp_origin_rot[1];
            var tmp_canvas_pt = [canvas_pt[0], canvas_pt[1]];
            canvas_pt[0] = tmp_canvas_pt[0] * cos - tmp_canvas_pt[1] * sin;
            canvas_pt[1] = tmp_canvas_pt[0] * sin + tmp_canvas_pt[1] * cos;
            canvas_pt[0] += tmp_origin_rot[0];
            canvas_pt[1] += tmp_origin_rot[1];

            tmp_origin[0] -= tmp_origin_rot[0];
            tmp_origin[1] -= tmp_origin_rot[1];
            var tmp_tmp_origin = [tmp_origin[0], tmp_origin[1]];
            tmp_origin[0] = tmp_tmp_origin[0] * cos - tmp_tmp_origin[1] * sin;
            tmp_origin[1] = tmp_tmp_origin[0] * sin + tmp_tmp_origin[1] * cos;
            tmp_origin[0] += tmp_origin_rot[0];
            tmp_origin[1] += tmp_origin_rot[1];

            // offset scale
            canvas_pt[0] -= tmp_origin[0];
            canvas_pt[1] -= tmp_origin[1];
            canvas_pt[0] *= grid.transform.sx;
            canvas_pt[1] *= grid.transform.sy;
            canvas_pt[0] += tmp_origin[0];
            canvas_pt[1] += tmp_origin[1];
            
            // return canvas point of original grid pt
            return canvas_pt;
        }
        grid.get_grid_point = function(canvas_pt) {

            // create new var to not disturb input value
            var grid_pt = [canvas_pt[0], canvas_pt[1]];

            // rotation vars
            var rad = grid.transform.ang * Math.PI / 180;
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);

            // offset translate
            grid_pt[0] -= grid.transform.x;
            grid_pt[1] -= grid.transform.y;
            
            // offset rotate
            grid_pt[0] -= grid.rot_origin[0];
            grid_pt[1] -= grid.rot_origin[1];
            var tmp_grid_pt = [grid_pt[0], grid_pt[1]];
            grid_pt[0] = tmp_grid_pt[0] * cos - tmp_grid_pt[1] * sin;
            grid_pt[1] = tmp_grid_pt[0] * sin + tmp_grid_pt[1] * cos;
            grid_pt[0] += grid.rot_origin[0];
            grid_pt[1] += grid.rot_origin[1];

            // offset scale
            grid_pt[0] -= grid.scale_origin[0];
            grid_pt[1] -= grid.scale_origin[1];
            grid_pt[0] /= grid.transform.sx;
            grid_pt[1] /= grid.transform.sy;
            grid_pt[0] += grid.scale_origin[0];
            grid_pt[1] += grid.scale_origin[1];

            // return grid point of original canvas pt
            return grid_pt;
        }
        grid.get_tile = function(pt) {return grid.map[pt[0]][pt[1]];}
        grid.get_load = function() {return this.load;}

        // setters
        grid.load_sprite = function(spr) {this.load.push(spr);}
        grid.load_sprites = function(sprs) {this.load.push(...sprs);}
        grid.load_updater = grid.load_sprite; // alias
        grid.load_updaters = grid.load_sprites; // alias
        grid.empty_load = function() {this.load = [];}
        grid.reset_transform = function() {this.transform = {
            x  : 0,  y : 0, // translation
            sx : 1, sy : 1, // scale
            ang : 0         // rotation (degs)
        }}

        // Efficient Transformation Algorithm:
        // - save current canvas to 'pre_grid_canvas'
        // - clear current canvas
        // - update all grid objects
        // - apply grid transformation matrix to current canvas image
        // - draw current canvas on top of pre_grid_canvas
        // - set pre_grid_canvas as current canvas
        // main update
        grid.update = function() {

            // update extra custom script
            grid.update_before();

            // save current canvas & clear it
            pre_grid_canvas = grid.scene.copy();
            grid.scene.clear();

            // background
            if (grid.bg) grid.bg.update();

            // tiles
            for (var x in grid.map) {
                for (var y in grid.map[x]) {
                    grid.map[x][y].update();
                }
            }

            // loaded sprites/updaters
            for (var i in grid.load) {
                grid.load[i].update();
            }

            // navmesh
            if (grid.nav) grid.nav.update();

            // transformation controls
            grid.update_controls();

            // rect
            grid.update_rect();

            // update extra custom script
            grid.update_more();

            // apply transformations and draw grid
            grid.draw();
        }

        // applies an extra script to pre-frame updates
        grid.update_before = function() {

            //...override
        }

        // applies an extra script to post-frame updates
        grid.update_more = function() {

            //...override
        }

        // applies transformations to the grid + draws grid
        grid.draw = function() {

            // get context of tmp canvas
            var tmp_ctx = pre_grid_canvas.getContext("2d");
            
            // translate
            tmp_ctx.translate(grid.transform.x, grid.transform.y);

            // rotate
            tmp_ctx.translate(grid.rot_origin[0], grid.rot_origin[1]);
            tmp_ctx.rotate(grid.transform.ang * Math.PI / 180 * -1);
            tmp_ctx.translate(-grid.rot_origin[0], -grid.rot_origin[1]);

            // scale
            tmp_ctx.translate(grid.scale_origin[0], grid.scale_origin[1]);
            tmp_ctx.scale(grid.transform.sx, grid.transform.sy);
            tmp_ctx.translate(-grid.scale_origin[0], -grid.scale_origin[1]);

            // copy antialiasing property
            tmp_ctx.imageSmoothingEnabled = this.scene.antialias;
            
            // draw transformed canvas into the old canvas
            tmp_ctx.drawImage(grid.scene.canvas, 0, 0);

            // paint current canvas onto pre_grid_canvas
            grid.scene.clear();
            var ctx = grid.scene.context;
            ctx.imageSmoothingEnabled = this.scene.antialias; // copy antialiasing property
            ctx.drawImage(pre_grid_canvas, 0, 0);

            // let go of the pre_grid_canvas
            pre_grid_canvas = null;
        }

        // updates the grid's rect & bbox
        grid.update_rect = function() {

            // get offset position (from topleft corners)
            var offset = grid.get_canvas_point([0,0]);

            // apply transformations (from topleft corner)
            grid.rect.set_pos(offset[0], offset[1]);
            grid.rect.set_rot(grid.transform.ang);
            grid.rect.set_scale2(grid.transform.sx, grid.transform.sy);
            
            // sprite update
            grid.rect.update();
        }

        // updates any transformation controls
        grid.update_controls = function() {

            for (var i in grid.controls)
                grid.controls[i]();
        }
    }

    ,

    build_specializations : function(grid) {

        if (grid.tdata) GridBuilder.build_translator(grid);
        if (grid.rdata) GridBuilder.build_rotator(grid);
        if (grid.sdata) GridBuilder.build_scaler(grid);
        if (grid.limits) GridBuilder.build_limiter(grid);
        if (grid.ndata) GridBuilder.build_navmesh(grid);
    }

    ,

    build_translator : function(grid) {

        // check if user has specified controls
        if (grid.tdata.controls) {

            // add specified control functions
            grid.controls.push(function() {

                // vars
                var spd = grid.tdata.speed;

                // move when mouse is near screen boundaries
                if (grid.tdata.controls.mouse) {

                    // vars
                    var w = grid.scene.get_w();
                    var h = grid.scene.get_h();
                    var ms = [grid.scene.mouse_x, grid.scene.mouse_y];
                    var buffer = grid.tdata.buffer;

                    // move left
                    if (ms[0] > w - buffer) {
                        grid.translate(-spd, 0);
                    }
                    // move right
                    if (ms[0] < buffer) {
                        grid.translate(spd, 0);
                    }
                    // move up
                    if (ms[1] > h - buffer) {
                        grid.translate(0, -spd);
                    }
                    // move down
                    if (ms[1] < buffer) {
                        grid.translate(0, spd);
                    }
                }

                // move left when specified key is pressed
                if (grid.tdata.controls.left)
                    if (grid.scene.key_downs[grid.tdata.controls.left])
                        grid.translate(-spd, 0);

                // move right when specified key is pressed
                if (grid.tdata.controls.right)
                    if (grid.scene.key_downs[grid.tdata.controls.right])
                        grid.translate(spd, 0);
                        
                // move up when specified key is pressed
                if (grid.tdata.controls.up)
                    if (grid.scene.key_downs[grid.tdata.controls.up])
                        grid.translate(0, -spd);
                    
                // move down when specified key is pressed
                if (grid.tdata.controls.down)
                    if (grid.scene.key_downs[grid.tdata.controls.down])
                        grid.translate(0, spd);
            });
        }

        // translate function
        grid.translate = function(offx,offy) {

            // set transform
            grid.transform.x += offx;
            grid.transform.y += offy;
        }
    }

    ,

    build_rotator : function(grid) {

        // set rotation origin at mouse
        grid.set_rot_origin_at_ms = function(smooth=true) {
            var ms_grid = grid.get_mouse();
            if (!smooth)
                grid.rot_origin = ms_grid;
            else {
                var pre = grid.get_canvas_point([0,0]);
                grid.rot_origin = ms_grid;
                var post = grid.get_canvas_point([0,0]);
                var odiff = Nickel.UTILITY.subtract_vector(pre, post);
                grid.translate(odiff[0], odiff[1]);
            }
        }

        // set rotation origin
        grid.set_rot_origin = function(grid_pt, smooth=true) {
            if (!smooth) {
                grid.rot_origin = grid_pt;
            } else {
                var pre = grid.get_canvas_point([0,0]);
                grid.rot_origin = grid_pt;
                var post = grid.get_canvas_point([0,0]);
                var odiff = Nickel.UTILITY.subtract_vector(pre, post);
                grid.translate(odiff[0], odiff[1]);
            }
        }

        // center of rotation
        if (grid.rdata.origin == 'center')
            grid.set_rot_origin(grid.get_grid_point(grid.rect.get_center()), false);
        else if (Nickel.UTILITY.is_array(grid.rdata.origin))
            grid.set_rot_origin([grid.rdata.origin[0], grid.rdata.origin[1]], false);

        // check if user has specified controls
        if (grid.rdata.controls) {

            // add specified control functions
            grid.controls.push(function() {

                // check secondary key if specified
                if ((grid.rdata.controls.secondary &&
                    grid.scene.key_downs[grid.rdata.controls.secondary]) ||
                    !grid.rdata.controls.secondary) {

                    // turn cc/anti-cc if keys pressed
                    var degrees = 0;
                    if (grid.rdata.controls.left)
                        if (grid.scene.key_downs[grid.rdata.controls.left])
                            degrees = -grid.rdata.speed;
                    if (grid.rdata.controls.right)
                        if (grid.scene.key_downs[grid.rdata.controls.right])
                            degrees = grid.rdata.speed;

                    // set center of rotation to mouse if needed
                    if (grid.rdata.origin == 'mouse')
                        grid.set_rot_origin_at_ms();

                    // apply rotation
                    grid.rotate(degrees/*, grid.rot_origin <-- default value */);
                }
            });
        }

        // rotate function
        grid.rotate = function(angle, origin=grid.rot_origin, smooth=false) {

            // set transform
            grid.set_rot_origin([origin[0], origin[1]], smooth);
            grid.transform.ang += angle;
        }
    }

    ,

    build_scaler : function(grid) {

        // set scaling origin at mouse
        grid.set_scale_origin_at_ms = function(smooth=true) {
            var ms_grid = grid.get_mouse();
            if (!smooth)
                grid.scale_origin = ms_grid;
            else {
                var pre = grid.get_canvas_point([0,0]);
                grid.scale_origin = ms_grid;
                var post = grid.get_canvas_point([0,0]);
                var odiff = Nickel.UTILITY.subtract_vector(pre, post);
                grid.translate(odiff[0], odiff[1]);
            }
        }

        // set scaling origin
        grid.set_scale_origin = function(grid_pt, smooth=true) {
            if (!smooth) {
                grid.scale_origin = grid_pt;
            } else {
                var pre = grid.get_canvas_point([0,0]);
                grid.scale_origin = grid_pt;
                var post = grid.get_canvas_point([0,0]);
                var odiff = Nickel.UTILITY.subtract_vector(pre, post);
                grid.translate(odiff[0], odiff[1]);
            }
        }

        // set center of scaling
        if (grid.sdata.origin == 'center')
            grid.set_scale_origin(grid.get_grid_point(grid.rect.get_center()), false);
        else if (Nickel.UTILITY.is_array(grid.sdata.origin))
            grid.set_scale_origin([grid.sdata.origin[0], grid.sdata.origin[1]], false);

        // check if user has specified controls
        if (grid.sdata.controls) {

            // add specified control functions
            grid.controls.push(function() {

                // zoom in/out if scrolling
                if (grid.scene.wheel_impulse != 0) {
                    
                    // new scale based on scroll wheel and speed multiplier
                    var scale  = (grid.scene.wheel_impulse / 10000 * grid.sdata.speed) + 1;

                    // set center of scaling to mouse if needed
                    if (grid.sdata.origin == 'mouse')
                        grid.set_scale_origin_at_ms();
                    
                    // apply scaling
                    grid.scale(scale/*, grid.scale_origin <-- default value */);
                    
                    // reset wheel impulse
                    grid.scene.wheel_impulse = 0;
                }
            });
        }

        // scale function
        grid.scale = function(scale, origin=grid.scale_origin, smooth=false) {

            // set transform
            grid.set_scale_origin([origin[0], origin[1]], smooth);
            grid.transform.sx *= scale;
            grid.transform.sy *= scale;

            // limit the scales
            grid.bound_scale();

            /* OLD, INEFFICIENT METHOD
            //simplify
            var sdata = grid.sdata;
            var tdata = grid.tdata;

            //apply bound action
            // - zoom out
            if (scale < 1) {
                if (grid.rect.get_scaleg() == sdata.bounds.out) return;
                if (grid.rect.get_scaleg() * scale < sdata.bounds.out) {
                    scale = sdata.bounds.out / grid.rect.get_scaleg();
                }
            // - zoom in
            } else if (scale > 1) {
                if (grid.rect.get_scaleg() == sdata.bounds.in) return;
                if (grid.rect.get_scaleg() * scale > sdata.bounds.in) {
                    scale = sdata.bounds.in / grid.rect.get_scaleg();
                }
            // - no zoom
            } else {
                return;
            }

            // translational bounds
            if(tdata) {
                tdata.bounds.left   /= scale;
                tdata.bounds.right  /= scale;
                tdata.bounds.top    /= scale;
                tdata.bounds.bottom /= scale;
            }
            */
        }

        // bound scaling
        grid.bound_scale = function() {

            if (grid.transform.sx > grid.sdata.bounds.in)
                grid.transform.sx = grid.sdata.bounds.in;
            if (grid.transform.sy > grid.sdata.bounds.in)
                grid.transform.sy = grid.sdata.bounds.in;
            if (grid.transform.sx < grid.sdata.bounds.out)
                grid.transform.sx = grid.sdata.bounds.out;
            if (grid.transform.sy < grid.sdata.bounds.out)
                grid.transform.sy = grid.sdata.bounds.out;
        }
    }

    ,

    build_limiter : function(grid) {

        // bounds the camera within a padded rectangle
        grid.controls.push(function() {

            // update rect
            grid.update_rect();

            // if scale has become so large that
            // at least 1 limit is always violated,
            // increase the limits temporarily:
            // check width
            var min_w = grid.scene.get_w() - grid.limits_orig.pad_left - grid.limits_orig.pad_right;
            if (grid.rect.bbox.w < min_w) {
                var pad = (grid.scene.get_w() - grid.rect.bbox.w) / 2;
                grid.limits.pad_left = pad;
                grid.limits.pad_right = pad;
            } else {
                grid.limits.pad_left = grid.limits_orig.pad_left;
                grid.limits.pad_right = grid.limits_orig.pad_right;
            }
            // check height
            var min_h = grid.scene.get_h() - grid.limits_orig.pad_top - grid.limits_orig.pad_bottom;
            if (grid.rect.bbox.h < min_h) {
                var pad = (grid.scene.get_h() - grid.rect.bbox.h) / 2;
                grid.limits.pad_top = pad;
                grid.limits.pad_bottom = pad;
            } else {
                grid.limits.pad_top = grid.limits_orig.pad_top;
                grid.limits.pad_bottom = grid.limits_orig.pad_bottom;
            }

            // displacements from canvas edge
            // (negative when out of screen)
            var l = grid.rect.get_left();
            var r = grid.scene.get_w() - grid.rect.get_right();
            var t = grid.rect.get_top();
            var b = grid.scene.get_h() - grid.rect.get_bottom();

            // apply bounding corrections
            if (l > grid.limits.pad_left)
                grid.translate(grid.limits.pad_left - l, 0);
            
            if (r > grid.limits.pad_right)
                grid.translate(r - grid.limits.pad_right, 0);

            if (t > grid.limits.pad_top)
                grid.translate(0, grid.limits.pad_top - t);
            
            if (b > grid.limits.pad_bottom)
                grid.translate(0, b - grid.limits.pad_bottom);
        });
    }

    ,

    build_navmesh : function(grid) {

        grid.nav = NavBuilder.create_navmesh(grid, grid.ndata);
    }

}//end grid builder



////////////////////////////////////////////
///   TILE BUILDER   ///////////////////////
////////////////////////////////////////////
var TileBuilder = {

    create_tile : function(tile_data) {

        //extract data
        scene = tile_data.scene;
        img   = tile_data.img_data;
        types = tile_data.types;

        //tile inherits sprite
        var tile = new Sprite(scene, img);

        //properties
        tile.types = types;
        tile.bound = function() {/* Continue */};

        return tile;
    }

}//end tile builder



////////////////////////////////////////////
///   NAVMESH BUILDER   ////////////////////
////////////////////////////////////////////
var NavBuilder = {

    create_navmesh : function(host, data) {

        /***

            Thoughts:
            ---------

            Grid must have tiles for a navmesh to work,
            The navmesh should be a sprite (so it can perform transformations)

            types:  Basic       ->  each node has the following variables: G,Parent,Weight
                                ->  this obj has the following special functions: path_to, all_paths, nearest, furthest, nearer(user defined)
                     \-> used for Dijkstra, BFS, DFS

                    Optimized   ->  each node has the following variables: G,H,F,Parent,Weight
                                ->  this obj has the following special functions: hueristic(user defined), path_to, nearest, furthest, nearer(user defined)
                     \-> used for A*, Theta*, Lazy Theta

                    field       ->  each node has the following variables: Radius,Shape,?
                     \-> used for Map-segmentation, Voroni, Weighted fields that affect pathfinding




                    --- Actually, combine Optimized and Basic and make the field a seperate system


                    Field system:   nav should have a field list. Each field is an object. The object will have the following:
                                        - Shape
                                            - Circle:       x,y,radius
                                            - Rectangle:    x,y,w,h
                                        - user defined 'effect' function


        ***/

        //init
        var nav = this;
        nav.w = host.tiles_east;
        nav.h = host.tiles_south;

        // extract data
        var node_data = data.node_data;
        nav.fields = data.field_list;

        // map navigation nodes to tiles
        nav.nodes = [];
        for (var x=0; x<nav.w; x++) {

            nav.nodes.push([]);
            for (var y=0; y<nav.h; y++) {

                // this part is only if user wants to debug
                if (node_data.type == "debug") {
                    node_data.grid = host;
                    node_data.tile = host.map[x][y];
                }

                // generic part
                var node = new NavNode(node_data);
                node.x = x;
                node.y = y;
                nav.nodes[x].push(node);
            }
        }

        // apply fields to tiles
        for (var i in nav.fields) {
            var field = nav.fields[i];
            if (field.shape == 'rectangle') {

                // add effect and/or blockages to rectangle grid
                for (var j=field.x; j<field.x+field.w; j++) {
                    for (var k=field.y; k<field.y+field.h; k++) {
                        if (field.effect)
                            nav.nodes[j][k].effects.push(field.effect);
                        if (field.blocked)
                            nav.nodes[j][k].blocked = true;
                    }
                }
            } else if (field.shape == 'point') {

                // add effect and/or blockages to a single node
                if (field.effect)
                    nav.nodes[field.x][field.y].effects.push(field.effect);
                if (field.blocked)
                    nav.nodes[field.x][field.y].blocked = true;
            }
        }

        nav.at = function(pt) {
            return nav.nodes[pt[0]][pt[1]];
        }

        // user can run a function which takes in
        //  a navnode to all navnodes
        nav.apply_to_all = function(func) {
            for (x=0; x<host.tiles_east; x++) {
                for (y=0; y<host.tiles_south; y++) {
                    func(nav.nodes[x][y]);
                }
            }
        }

        nav.place = {

            // place sprite at some position/sprite
            at : function(spr, dest) {
                /*** Old (working) snippet
                if (dest instanceof Array) {
                    var target = host.map[dest[0]][dest[1]];
                } else if (dest instanceof Sprite) {
                    var target = dest;
                }***/
                var target = Nickel.UTILITY.determine_destination(host, dest);

                var c = target.get_center();
                spr.set_center(c[0],c[1]);
            }// end at

            ,

            // place sprite at closest available position to position/sprite
            near : function(spr, dest) {
                var target = Nickel.UTILITY.determine_destination(host, dest);

                                                                            ////////////     tiles must be a 2D list rectangle where start_area[0][0] is the topleft tile.    !!!!
                var start_area = target.get_occupied_tiles();    ///////////////////////******************   IMPLEMENT THIS FUNCTION !  ******** HERE ***
                var nearest = Pathfinder.nearest_neighbor(host, start_area);
                var c = nearest.get_center();
                spr.set_center(c[0],c[1]);
            }// end near

            ,

            // place sprite randomly around position/sprite
            around : function(spr, dest) {
                var target = Nickel.UTILITY.determine_destination(host, dest);

                var start_area = target.get_occupied_tiles();    ///////////////////////******************   IMPLEMENT THIS FUNCTION !   HERE
                var neighbors = Pathfinder.bordering_neighbors(host, start_area);
                var pick = Nickel.UTILITY.random_element(neighbors);
                var c = pick.get_center();
                spr.set_center(c[0],c[1]);
            }// end around

        };

        nav.move = {

            to : function(spr, dest) {
                var target = Nickel.UTILITY.determine_destination(host, dest);

                var path = Pathfinder.find_path_to(host, spr, target);
                spr.ai.set_path( path );            //////////////////////////////////***************   IMPLEMENT later...          HERE
                spr.follow_path();                  //////////////////////////////////***************   IMPLEMENT later...          HERE
            }

            ,

            near_to : function(spr, dest) {
                var target = Nickel.UTILITY.determine_destination(host, dest);

                var path = Pathfinder.find_path_near(host, spr, target);
                spr.ai.set_path( path );
                spr.follow_path();
            }

            ,

            around_to : function() {
                var target = Nickel.UTILITY.determine_destination(host, dest);

                var path = Pathfinder.find_path_around(host, spr, target);
                spr.ai.set_path( path );
                spr.follow_path();
            }

        };

        nav.update = function() {

            // update all nav nodes
            nav.apply_to_all(function(navnode) {
                navnode.update();
            });

        }

        return nav;

    }

}//end nav builder



////////////////////////////////////////////
///   NAVNODE BUILDER   ////////////////////
////////////////////////////////////////////
var NavNodeBuilder = {

    create_node : function(node, data) {

        //extract data
        node.data = data;

        // Parent, Cost from source, Hueristic cost to end
        node.P = null;
        node.G = 0;
        node.H = 0;

        // list of functions incrementing/decrementing priority
        // effects will determine priority
        node.effects = [];

        // large priority means more favorable,
        // small priority means less favorable,
        // zero priority means it's nuetral
        node.priority = 0;
        node.get_weight = function () {return -node.priority;}

        // if node is not passable
        node.blocked = false;

        // position vars
        node.x = -1;
        node.y = -1;
        node.pos = function () {return [node.x,node.y];}
    }

    ,

    build_specializations : function(node) {

        if (node.data.type == "debug") {

            node.spr = new Sprite(node.data.grid.scene, node.data.spr_data, true);
            node.spr.bound = function() {};
            node.spr.set_origin_centered();
            node.til = node.data.tile;

            node.update = function() {
                if (node.P) {
                    var par = node.data.grid.map[node.P.x][node.P.y];
                    node.spr.turn_to(par);
                }
                node.spr.set_center(node.til.get_cx(), node.til.get_cy());
                if (node.P) node.spr.update();
            }

        } else {

            node.update = function() {}

        }

    }

}//end nav node builder



////////////////////////////////////////////
///   LOCOMOTIVE BUILDER   /////////////////
////////////////////////////////////////////
/**@todo: make the implementations of each function static */
var LocomotiveBuilder = {

    create_locomotive : function(loco_data) {

        // inherit from sprite and extract data
        var unit;
        if (loco_data.sprite)
            unit = loco_data.sprite;
        else
            unit = new Sprite(loco_data.scene,
                              loco_data.img_data,
                              true, null, false);

        // set type
        unit.type = "Locomotive";

        // if no sprite specified, init some properties
        if (!loco_data.sprite) {

            // set centered origin
            unit.set_origin_centered();

            // set bound
            if (!loco_data.bounding_func)
                unit.bound = function () {/* Continue */};
            else
                unit.bound = loco_data.bounding_func;

            // set max rotation per update
            unit.set_rot_max(loco_data.max_rot);

            // set collision hulls
            if (loco_data.hull)
                unit.set_hull(loco_data.hull);
            else if (loco_data.hull_exists)
                unit.set_hull(new ColliderHull(unit));
        }

        // edit basic copy ability
        unit.copy_base = function(do_update=true) {
            // similar code in Sprite.copy_base:
            if (unit.image)
                var _img_data = {img:unit.image.src, w:unit.get_w_orig(), h:unit.get_h_orig()};
            else
                var _img_data = {w:unit.get_w_orig(), h:unit.get_h_orig()};

            var copy = new Locomotive({
                scene :         unit.scene,
                img_data :      _img_data,
                hull_exists :   !!unit.hull,
                hull :          null,
                max_rot :       unit.max_rot
            });
            copy.bound = unit.bound;
            //copy.update_before = unit.update_before;
            //copy.update_more = unit.update_more;

            if (do_update)
                copy.update();

            return copy;
        }

        // edit frozen copy ability
        unit.copy_frozen = function(do_update=true){
            // similar code in Sprite.copy_frozen:
            var copy = unit.copy_base(false);

            // pos
            copy.x = unit.x;
            copy.y = unit.y;

            // scale
            copy.scale_global = unit.scale_global;
            copy.scale_x = unit.scale_x;
            copy.scale_y = unit.scale_y;

            // rot
            copy.dir = unit.dir;
            copy.rot = unit.rot;
            copy.max_rot = unit.max_rot;
            copy.origin = [unit.origin[0],unit.origin[1]];

            // other
            copy.dead = unit.dead;
            copy.visibility = unit.visibility;
            copy.layer = unit.layer;

            if (do_update)
                copy.update();

            return copy;
        }

        // return object
        return unit;
    },

    create_steering_behaviours : function(unit) {
        
        unit.closest = function(targets, fov_radius=Infinity) {
            //--    returns the closest sprite in the given fov
            //--

            // return false if empty
            if (!targets.length)
                return false;

            // get closest
            var c = unit.get_center();
            var min_dist = 9999999;
            var min_t = false;
            for (let t of targets) {
                
                // get target center
                if (Nickel.UTILITY.is_array(t)) {
                    
                    // get distance to target
                    var d = Pathfinder.distance_to(c, t);

                    // remember closer target (if in fov)
                    if (d <= fov_radius && min_dist > d) {
                        min_dist = d;
                        min_t = Nickel.v2d.copy(t);
                    }

                } else {
                    
                    // get distance to target
                    var d = Pathfinder.distance_to(c, t.get_center());

                    // remember closer target
                    if (d <= fov_radius && min_dist > d) {
                        min_dist = d;
                        min_t = t;
                    }
                }
            }

            // return closest target
            return min_t;
        }

        unit.limit_speed = function (max_spd=0, below=true) {
            //--    Limits the sprites speed to the given
            //--    limit. If below is set to true, than
            //--    the speed cannot exceen the limit, if
            //--    it is set to false, the speed cannot
            //--    fall below the limit.
            //--
            
            if (below) {
                if (unit.get_speed() > max_spd)
                    unit.set_speed(max_spd);
            } else {
                if (unit.get_speed() < max_spd)
                    unit.set_speed(max_spd);
            }
        }

        unit.ease_to_speed = function (speed,accel) {
            //--    Eases into the given speed by altering acceleration
            //--

            if (speed == unit.get_speed()) {

                // finish ease
                unit.set_accel(0);
            } else if (speed > unit.get_speed()) {

                // pos accel
                unit.set_accel(accel);

                // if next step exceeds, ease is finished
                if (speed < unit.get_speed() + unit.get_accel()) {
                    unit.set_speed(speed);
                    unit.set_accel(0);
                }
            } else {

                // neg accel
                unit.set_accel(accel * -1);

                // if next step exceeds, ease is finished
                if (speed > unit.get_speed() + unit.get_accel()) {
                    unit.set_speed(speed);
                    unit.set_accel(0);
                }
            }
        }

        unit.ease_to_speed2 = function (speed,max_ds) {
            //--    Eases into the given speed
            //--

            if (speed == unit.get_speed()) {

                // speed reached
                return true;
            } else if (speed > unit.get_speed()) {

                // speed is greater than current
                if (max_ds + unit.get_speed() >= speed)
                    unit.set_speed(speed);
                else
                    unit.set_speed(max_ds + unit.get_speed());
            } else {

                // speed is less than current
                if (unit.get_speed() - max_ds <= speed)
                    unit.set_speed(speed);
                else
                    unit.set_speed(unit.get_speed() - max_ds);
            }
        }

        unit.seek = function (target,speed,accel) {
            //--    seeks towards a position
            //--    (manipulates speed and accel)
            //--

            unit.ease_to_speed(speed,accel);
            unit.turn_to(target,false);
        }
        
        unit.seek2 = function (target,impulse) {
            //--    seeks towards a position
            //--    (manipulates impulse)
            //--
            
            unit.apply_impulse(impulse);
            unit.turn_to(target, false);
        }

        unit.seek3 = function(target,weight=1,apply_vec=false) {
            //--    Returns weighted direction vector to target
            //--    (seeks towards a position if specified)
            //--    (manipulates velocity)
            //--

            // get point
            if (!Nickel.UTILITY.is_array(target))
                target = target.get_center();

            // get unit vector from self to point
            var vec = Nickel.UTILITY.subtract_vector(target, unit.get_center());
            vec = Nickel.UTILITY.normalize_vector(vec);

            // get desired velocity vector
            vec[0] *= unit.get_speed() * weight;
            vec[1] *= unit.get_speed() * weight;
            
            // apply vector if needed
            if (apply_vec) unit.set_velocity(vec);

            // return weighted direction vector
            return vec;
        }

        /**
         * @deprecated since 4/20/2019
         * use "flee2" instead
         */
        unit.flee = function (target,fov_radius,speed,accel) {
            //--    flees away from a position
            //--    returns int representing current stage
            //--    Stages:
            //--    0   :   not fleeing from target
            //--    1   :   fleeing from target
            //--
            
            // TODO: automatically determine impulse based on FOV penetration depth FIX HERE!

            // determine target
            if (!Nickel.UTILITY.is_array(target)) {
                target = target.get_center();
            }

            // if target is not in FOV, ignore
            if (Pathfinder.distance_to(unit.get_center(), target) > fov_radius) {
                return 0;
            }
            // if target is in FOV, turn away from target
            else {
                var cx = unit.get_cx();
                var cy = unit.get_cy();
                var new_target = [cx + (cx-target[0]), cy + (cy-target[1])];

                // seek away from target
                unit.seek(new_target,speed,accel);
                return 1;
            }
        }

        /**
         * @todo utilize flee3 internally
         */
        unit.flee2 = function (target,fov_radius,weight=1,apply_vec=false) {
            //--    flees away from a position (if specified)
            //--    returns flee vector
            //--

            // determine target
            if (!Nickel.UTILITY.is_array(target)) {
                target = target.get_center();
            }

            // if target is not in FOV, ignore
            var c = unit.get_center();
            if (Pathfinder.distance_to(c, target) > fov_radius) {
                return [0,0];
            }
            // if target is in FOV, move away from target
            else {
                var opp = Nickel.UTILITY.subtract_vector(c, target);
                opp = Nickel.UTILITY.normalize_vector(opp);
                opp[0] *= unit.get_speed() * weight;
                opp[1] *= unit.get_speed() * weight;
                if (apply_vec) unit.set_velocity(opp);
                //JUNK var vel = unit.get_velocity();
                //JUNK var vec = Nickel.UTILITY.subtract_vector(opp, vel);
                //JUNK return vec;
                return opp;
            }
        }

        unit.flee3 = function (target,weight=1,apply_vec=false) {
            //--    same as flee2 except does not check fov
            //--

            // determine target
            if (!Nickel.UTILITY.is_array(target)) {
                target = target.get_center();
            }

            // if target is not in FOV, ignore
            var c = unit.get_center();
            
            // move away from target
            var opp = Nickel.UTILITY.subtract_vector(c, target);
            opp = Nickel.UTILITY.normalize_vector(opp);
            opp[0] *= unit.get_speed() * weight;
            opp[1] *= unit.get_speed() * weight;
            if (apply_vec) unit.set_velocity(opp);
            //JUNK var vel = unit.get_velocity();
            //JUNK var vec = Nickel.UTILITY.subtract_vector(opp, vel);
            //JUNK return vec;
            return opp;
        }
        
        /**
         * @deprecated since 6/10/2019
         * use "arrive2" instead
         */
        unit.arrive = function (target,accel,max_speed,min_speed,
                                arrive_radius,buffer_radius,
                                halt=true,round_places=0) {
            //--    softly arrives at a position
            //--    returns int representing current stage
            //--    Stages:
            //--    0   :   target not in yet in fov
            //--    1   :   target in fov, but not arrived yet
            //--    2   :   target arrived or stopped
            //--

            // determine target
            if (!Nickel.UTILITY.is_array(target)) {
                target = target.get_center();
            }

            // if target is not in FOV, ignore
            var dist_to_target = Pathfinder.distance_to(unit.get_center(), target);
            if (dist_to_target > arrive_radius) {
                return 0;
            }
            // if speed is low enough, arrive finishes (if halting)
            else if (halt && unit.get_speed() <= min_speed) {

                // round to 0
                unit.set_speed(0);

                // indicates target reached
                return 2;

            }
            // if position is close enough, arrive finishes
            else if (Nickel.UTILITY.round(dist_to_target,round_places) <= buffer_radius) {

                // halt regardless (speed should be already about zero)
                //unit.set_speed(0);
                unit.ease_to_speed(0,accel);

                // indicates target reached
                return 2;
            }
            // if target is in FOV, ease into target
            else {
                //unit.set_accel(0);
                //var ease = (dist_to_target-buffer_radius) / (arrive_radius-buffer_radius);
                //unit.set_speed(ease * max_speed);
                var ease = dist_to_target / arrive_radius;
                unit.ease_to_speed(ease * max_speed, accel);
                unit.turn_to(target,false);

                return 1;
            }
        }

        /**
         * @TODO test this
         */
        unit.arrive2 = function (target,arrive_radius,weight=1,apply_vec=false) {
            //--    softly arrives at a position
            //--    returns 0 if target not in fov
            //--    otherwise, returns an arrival vector
            //--

            // determine target
            if (!Nickel.UTILITY.is_array(target)) {
                target = target.get_center();
            }

            // if not in radius, return 0
            var ctr = unit.get_center();
            var dist = Pathfinder.distance_to(target, ctr);
            if (dist > arrive_radius) return 0;

            // get unit vector from self to point
            var vec = Nickel.UTILITY.subtract_vector(target, ctr);
            vec = Nickel.UTILITY.normalize_vector(vec);

            // determine arrival multiplier
            var arv = dist / arrive_radius; // 0 if arrived, 1 if at arrive radius

            // get desired velocity vector
            vec[0] *= unit.get_speed() * arv * weight;
            vec[1] *= unit.get_speed() * arv * weight;
            
            // apply vector if needed
            if (apply_vec) unit.set_velocity(vec);

            // get seek vector (current v to desired v)
            //JUNK var vel = unit.get_velocity();
            //JUNK vec = Nickel.UTILITY.subtract_vector(vec, vel);
            
            // return arrival vector
            return vec;
        }

        unit.wander = function (weight=1, smooth_chance=50, apply_vec=false,
                                max_rot=unit.get_rot_max()) {
            //--    randomly wanders from the current position
            //--

            // get turn direction (sign of displacement indicates direction)
            // positive = counter-clockwise
            // negative = clockwise
            // 0 = none
            var dir = Math.sign(unit.get_last_rot());
            if (!dir) {
                dir = Nickel.UTILITY.random_number(0,1);
                if (!dir)
                    dir = -1;
            }

            // should we keep turning in same direction?
            var rnd_smooth = Nickel.UTILITY.random_number(0,100);
            var smooth = false;
            if (rnd_smooth <= smooth_chance)
                smooth = true;
                
            // choose random number between 0 and maximum turning rate
            var turn = Nickel.UTILITY.random_number(0,Math.round(max_rot*100000)) / 100000;

            // if smooth, turn in the same direction
            if (smooth) {
                turn *= dir;

            // if not, turn in the opposite direction
            } else {
                turn *= dir * -1;
            }

            // unit direction vector multiply with speed, weight
            var rads = (unit.get_dir() + turn) / 180 * Math.PI;
            var vec = [Math.cos(rads) * unit.get_speed() * weight,
                       Math.sin(rads) * unit.get_speed() * weight * -1];
            
            // apply vector if needed
            if (apply_vec) unit.set_velocity(vec);

            // get seek vector (current v to desired v)
            //JUNK var vel = unit.get_velocity();
            //JUNK vec = Nickel.UTILITY.subtract_vector(vec, vel);
            
            // return wander vector
            return vec;
        }

        /**
         * @deprecated since 6/10/2019
         * use "follow2" instead
         */
        unit.follow = function (path,index=0,patrol=false) {
            //--    follows the given path
            //--    returns index of current path element
            //--    returns -1 if path complete
            //--    returns -2 if error
            //--
            //--    path:
            //--        List of Objects where first Object is first element
            //--        of path and final destination is last element of path.
            //--
            //--    path Object:
            //--        target = [x-position, y-position] OR Sprite,
            //--        seek_speed,
            //--        seek_accel,
            //--        arrive_max_speed,
            //--        arrive_min_speed,
            //--        arrive_radius,
            //--        buffer_radius,
            //--        halt=true,
            //--        skip_arrival,
            //--        round_places (default = 0)
            //--
            //--    skip_arrival allows for unit to skip arriving at the target
            //--    and instead just start seeking to the next target
            //--

            // edge case (null or empty)
            if (!path || !path.length) {

                // bad path
                console.log("Warning: path is null or empty.");
                return -2;
            }

            // edge case (index doesn't exist)
            if (!path[index]) {

                // restart path if patrol
                if (patrol)
                    return 0;

                // else, path finished
                return -1;
            }

            // simplify some stuff
            var curr = path[index];
            var rounding = curr.round_places;
            if (!rounding) rounding = 0;

            // start moving if stopped
            if (!unit.get_speed())
                unit.set_speed(curr.seek_accel);

            // arrive at current path node
            var arrive_state = unit.arrive(curr.target,curr.arrive_max_speed,curr.arrive_min_speed,
                                           curr.arrive_radius,curr.buffer_radius,
                                           curr.halt,rounding);

            // if not in arrive radius
            if (arrive_state == 0) {

                // seek target
                unit.seek(curr.target,curr.seek_speed,curr.seek_accel);
            }

            // if in arrived radius but not arrived
            else if (arrive_state == 1) {

                // if we want to skip this arrival
                if (curr.skip_arrival) {

                    // next index
                    index++;
                }
            }

            // if arrived
            else if (arrive_state == 2) {

                // next index
                index++;
            }

            // return sought after target
            return index;
        }

        /**
         * @TODO test
         */
        unit.follow2 = function (path,reach_radius,weight=1,index=0,apply_vec=false,
                                 arrive=false,arrive_radius=0,patrol=false) {
            //--    Follows a given path recursively.
            //--    'path' is an array of 2D coordinates or Sprites.
            //--
            //--    Returns:
            //--    - if target remains:        [index of target, follow vector]
            //--    - if last target reached:   true
            //--

            // end reached
            if (index >= path.length || index === true) {

                // patrol
                if (patrol) {
                    return unit.follow2(
                        path,
                        reach_radius,
                        weight,
                        0, // start index
                        apply_vec,
                        arrive,
                        arrive_radius,
                        patrol
                    );
                }

                // path complete
                return true;
            }
            
            // get target coordinates
            var next = path[index];
            
            if (!Nickel.UTILITY.is_array(next))
                next = next.get_center();

            // reach target
            var curr = unit.get_center();
            var dist = Pathfinder.distance_to(curr, next);
            if (dist <= reach_radius) {

                // next target
                return unit.follow2(
                    path,
                    reach_radius,
                    weight,
                    ++index, // next index
                    apply_vec,
                    arrive,
                    arrive_radius,
                    patrol
                );
            }

            // try to arrive to target
            if (arrive) {
                var arv = unit.arrive2(next, arrive_radius, weight, apply_vec);
                
                // arriving!
                if (arv) {
                    return [index, arv];
                }
            }

            // seek target
            return [index, unit.seek3(next, weight, apply_vec)];
        }

        /**
         * @deprecated since 4/20/2019
         * use "separate2" instead
         */
        unit.separate = function (targets,crowd_radius,speed,accel,halt_not_found=true) {
            //--    separates a distance away from nearby targets
            //--    * looks for targets within crowd_radius
            //--    returns 0 if error
            //--    returns 1 if no target in crowd_radius
            //--    returns 2 if separating from 1 or more target
            //--

            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return 0;
            }

            var opposites = [];

            // center of unit at next frame (approx)
            var unit_center = unit.get_center();
            unit_center[0] += unit.get_speedx() + unit.get_accelx();
            unit_center[1] += unit.get_speedy() + unit.get_accely();

            // determine angle by analyzing all nearby
            for (var i in targets) {

                // determine target (and skip if target is self)
                var target = targets[i];
                if (!Nickel.UTILITY.is_array(target)) {
                    if (target.get_id() == unit.get_id())
                        continue;
                    target = target.get_center();
                }

                // if nearby
                var dist = Pathfinder.distance_to(unit_center,target);
                if (dist <= crowd_radius) {

                    // get my center
                    var cx = unit.get_cx();
                    var cy = unit.get_cy();

                    // compute an opposite vector
                    //opposite = [cx + (cx-target[0]), cy + (cy-target[1])];
                    var opposite = [cx-target[0], cy-target[1]];
                    opposite = Nickel.UTILITY.normalize_vector(opposite);
                    opposite[0] /= dist;
                    opposite[1] /= dist;

                    // add it
                    opposites.push(opposite);
                }
            }
            
            // no targets close enough
            if (!opposites.length) {

                // slowly halt if specified
                if (halt_not_found)
                    unit.ease_to_speed(0,accel);

                return 1;
            }

            // average out opposite vectors
            var net_opposite = [0,0];
            for (var i in opposites) {
                net_opposite[0] += opposites[i][0];
                net_opposite[1] += opposites[i][1];
            }
            net_opposite[0] /= opposites.length;
            net_opposite[1] /= opposites.length;
            
            // normalize & get desired position
            net_opposite = Nickel.UTILITY.normalize_vector(net_opposite);
            net_opposite[0] *= speed;
            net_opposite[1] *= speed;
            var vel = unit.get_velocity();
            net_opposite[0] -= vel[0];
            net_opposite[1] -= vel[1];
            
            // seek away from crowd
            unit.seek([unit_center[0]+net_opposite[0], unit_center[1]+net_opposite[1]],speed,accel);
            
            // alternate methods:
            //unit.set_accel( Math.min(accel, Nickel.UTILITY.magnitude_of_vector(net_opposite)) );
            //unit.turn_to( [unit_center[0]+net_opposite[0], unit_center[1]+net_opposite[1]], false );
            
            //unit.set_cx(unit_center[0]+net_opposite[0]);
            //unit.set_cy(unit_center[1]+net_opposite[1]);
            
            //unit.dx += net_opposite[0];
            //unit.dy += net_opposite[1];
            
            return 2;
        }

        unit.separate2 = function (targets,crowd_radius,weight=1,apply_vec=true) {
            //--    Separates from nearby sprites
            //--

            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return [0,0];
            }

            // vars
            var vel = [0,0];
            var nbors = 0;
            var my_ctr = unit.get_center();

            // add opposite positions of nearby agents
            for (var i in targets)
                if (targets[i].get_id() != unit.get_id())
                    if (Pathfinder.distance_to(targets[i].get_center(),
                                               my_ctr) <= crowd_radius) {
                        vel = Nickel.UTILITY.add_vector(vel, my_ctr);
                        vel = Nickel.UTILITY.subtract_vector(vel, targets[i].get_center());
                        nbors++;
                    }

            // exit if no nearby agents
            if (!nbors || (!vel[0] && !vel[1])) return [0,0];

            // get average opposite position
            vel[0] /= nbors;
            vel[1] /= nbors;

            // normalize with current speed and weightage
            var norm = Nickel.UTILITY.normalize_vector(vel);
            norm[0] *= unit.get_speed() * weight;
            norm[1] *= unit.get_speed() * weight;

            // set velocity
            if (apply_vec) unit.set_velocity(norm);

            // return new direction and speed
            return norm;
        }
        
        /**
         * @deprecated since 4/20/2019
         * use "cohere2" instead
         */
        unit.cohere = function (targets,crowd_radius,reach_radius,speed,accel,halt_not_found=true) {
            //--    coheres a distance towards nearby sprites
            //--    * looks for targets within crowd_radius
            //---   * the larger the reach_radius, the larger the destination circle is
            //--    returns 0 if error
            //--    returns 1 if no target in crowd_radius
            //--    returns 2 if cohering with 1 or more target
            //--

            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return 0;
            }

            var headings = [];

            var unit_center = unit.get_center();

            // determine angle by analyzing all nearby
            for (var i in targets) {

                // determine target (and skip if target is self)
                var target = [];
                if (!Nickel.UTILITY.is_array(targets[i])) {
                    if (targets[i].get_id() == unit.get_id())
                        continue;
                    target = targets[i].get_center();
                }

                // if nearby
                if (Pathfinder.distance_to(unit_center,target) <= crowd_radius) {

                    // add target position
                    headings.push(target);
                }
            }

            // no targets close enough
            if (!headings.length) {

                // slowly halt if specified
                if (halt_not_found)
                    unit.ease_to_speed(0,accel);

                return 1;
            }

            // average out heading vectors
            var net_heading = [0,0];
            for (var i in headings) {
                net_heading[0] += headings[i][0];
                net_heading[1] += headings[i][1];
            }
            net_heading[0] /= headings.length;
            net_heading[1] /= headings.length;
            
            // *** net_heading is now the center of the crowd ***

            // if surpassed reach radius
            if (reach_radius && Pathfinder.distance_to(unit_center,net_heading) <= reach_radius) {

                // indicate reach radius reached
                return 3;

            // if not surpassed reach radius (but within crowd radius)
            } else {

                // seek center of crowd
                unit.seek(net_heading, speed, accel);
                return 2;
            }
        }

        unit.cohere2 = function (targets,crowd_radius,weight=1,apply_vec=true) {
            //--    Coheres towards nearby sprites
            //--

            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return [0,0];
            }

            // vars
            var vel = [0,0];
            var nbors = 0;
            var my_ctr = unit.get_center();

            // add positions of nearby agents
            for (var i in targets)
                if (targets[i].get_id() != unit.get_id())
                    if (Pathfinder.distance_to(targets[i].get_center(),
                                               my_ctr) <= crowd_radius) {
                        vel = Nickel.UTILITY.add_vector(targets[i].get_center(), vel);
                        nbors++;
                    }

            // exit if no nearby agents
            if (!nbors || (!vel[0] && !vel[1])) return [0,0];

            // get average position
            vel[0] /= nbors;
            vel[1] /= nbors;

            // get vector from self to new position
            vel[0] -= my_ctr[0];
            vel[1] -= my_ctr[1];

            // normalize with weightage
            var norm = Nickel.UTILITY.normalize_vector(vel);
            norm[0] *= unit.get_speed() * weight;
            norm[1] *= unit.get_speed() * weight;

            // set velocity
            if (apply_vec) unit.set_velocity(norm);

            // return new direction and speed
            return norm;
        }
        
        /**
         * @deprecated since 4/20/2019
         * use "align2" instead
         */
        unit.align = function (targets,align_radius,match_speed=false,accel=0) {
            //--    aligns rotation and direction with nearby sprites
            //--    * looks for targets within align_radius
            //--    returns 0 if error
            //--    returns 1 if no target in align_radius
            //--    returns 2 if turning/altering speed to align
            //--

            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return 0;
            }

            var rotations = [];
            var speeds = [];

            var unit_center = unit.get_center();

            // determine angle by analyzing all nearby
            for (var i in targets) {
                
                // skip self
                if (targets[i].get_id() == unit.get_id())
                    continue;

                // target must be a sprite
                var target_angle = targets[i].get_rot();

                // if nearby
                if (Pathfinder.distance_to(unit_center,targets[i].get_center()) <= align_radius) {

                    // add target position (0 to 359)
                    rotations.push( Nickel.UTILITY.trim_angle(target_angle) );

                    // add speed if specified
                    if (match_speed)
                        speeds.push(targets[i].get_speed());
                }
            }

            // no targets close enough
            if (!rotations.length) {
                return 1;
            }

            // average out angles
            var net_rot = 0;
            for (var i in rotations) {
                net_rot += rotations[i];
            }
            net_rot /= rotations.length;

            // set turn without controlling destination
            unit.turn(net_rot,false,false);

            // ease to net speed if specified
            if (match_speed) {

                // average out speeds
                net_spd = 0;
                for (var i in speeds) {
                    net_spd += speeds[i];
                }
                net_spd /= speeds.length;

                // ease
                unit.ease_to_speed(net_spd,accel);
            }

            // unit is aligning...
            return 2;
        }
        
        unit.align2 = function (targets,align_radius,weight=1,apply_vec=true) {
            //--    Aligns the agent with nearby agents
            //--

            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return [0,0];
            }

            // vars
            var vel = [0,0];
            var nbors = 0;

            // add directions of nearby agents
            for (var i in targets)
                if (targets[i].get_id() != unit.get_id())
                    if (Pathfinder.distance_to(targets[i].get_center(),
                            unit.get_center()) <= align_radius) {
                        vel = Nickel.UTILITY.add_vector(targets[i].get_velocity(), vel);
                        nbors++;
                    }

            // exit if no nearby agents
            if (!nbors || (!vel[0] && !vel[1])) return [0,0];

            // get average direction
            vel[0] /= nbors;
            vel[1] /= nbors;

            // normalize with weightage
            var norm = Nickel.UTILITY.normalize_vector(vel);
            norm[0] *= unit.get_speed() * weight;
            norm[1] *= unit.get_speed() * weight;

            // set velocity
            if (apply_vec) unit.set_velocity(norm);

            // return new direction and speed
            return norm;
        }
        
        unit.boids = function (targets,a_r,c_r,s_r,a_w=1,c_w=1,s_w=1,weight=1,
                               apply_vec=true, debug=false) {
            //--    Causes the famous boids behavior pattern
            //--
            
            // do behaviors (these only affect the agent's speed and direction)
            var a = unit.align2(targets, a_r, a_w, false);
            var c = unit.cohere2(targets, c_r, c_w, false);
            var s = unit.separate2(targets, s_r, s_w, false);

            // add results
            var results = Nickel.UTILITY.add_vector(a,c);
            results = Nickel.UTILITY.add_vector(results,s);

            // exit early if nothing to be done
            if (!results[0] && !results[1]) {
                if (!debug)
                    return [0,0];
                else
                    return [[0,0], a, c, s];
            }

            // normalize and multiply the right speed
            var norm = Nickel.UTILITY.normalize_vector(results);
            norm[0] *= unit.get_speed() * weight;
            norm[1] *= unit.get_speed() * weight;

            // set velocity
            if (apply_vec) unit.set_velocity(norm);
            
            // return behavior results
            if (!debug)
                return norm;
            else
                return [norm, a, c, s];
        }
        
        /**
         * @todo make efficient by only creating one circle on self
         * instead of one on each target
        */
        unit.avoid_obstacles = function (targets,avoid_radius,sight_mult=10,apply_type=0,
                                         debug=false,weight=1) {
            //--    avoids obstacles in front of agent
            //--    * avoid_radius is how much the agent
            //--      should stay away from obstacles *
            //--    * if sight_mult is increased, it makes agent
            //--      look further to avoid more obstacles *
            //--    * if weight is increased,
            //--      the agent slows down more drastically *
            //--    * debug will return lists of useful data *
            //--
            //--    returns 0 if error
            //--    returns 1 if no collision threat detected or inside circle
            //--    returns [1, sight line-seg] if above and debug is true
            //--    returns 2 if collision detected and avoided
            //--    returns [2, sight line-seg, nearest circle,
            //--             collision data list, vec, target] if above and debug is true
            //--    * WILL also return velocity vector if apply type is 0 or 1 *
            //--
            //--    * collision data list includes:
            //--      - bool : did collision happen?
            //--      - [x,y] : closest pt from line's ray to circle's center
            //--      - number : distance from above pt to circle's center
            //--      - [[x0,y0],[x1,y1]?] : list of intersection pts on circle *
            //--   
            //--    apply_type = 0 means only data will be returned, the agent will do nothing (default)
            //--    apply_type = 1 means only a simple avoidance vector will be applied (and returned)
            //--    apply_type = 2 means a smart application of the avoidance will occur, utilizing
            //--                 weight to decelerate the agent
            //--    * data returned will be in same format regardless of apply_type *
            //--
            
            // edge case
            if (!targets.length) {
                //console.log("Warning: no targets!");
                return 0;
            }
            
            // create sight line
            var c = unit.get_center();
            var old_spd = unit.get_speed();
            unit.set_speed(old_spd * sight_mult + 10);
            var sight = new LineSegment(c, [c[0] + unit.get_speedx(),
                                            c[1] + unit.get_speedy()]);
            
            // reset original speed
            unit.set_speed(old_spd);
            
            // find closest intersecting target from among
            // list of targets' circles vs the sight line
            var nearest_circle = null;
            var tmp_dist = 999999999;
            var line_collision = null;
            var target_avoided = null;
            for (var i in targets) {
                
                // resolve if target is point or sprite
                // (and skip if target is self)
                var target = targets[i];
                if (!Nickel.UTILITY.is_array(targets[i])) {
                    if (targets[i].get_id() == unit.get_id())
                        continue;
                    target = targets[i].get_center();
                }
                
                // prepare radius circle
                var circle = new SimpleCircle(unit.scene, avoid_radius);
                circle.set_tracker(circle.get_center());
                circle.set_center(target);
                
                // check collision
                var tmp_line_collision = Collision_Detector.collides_circle_line(circle, sight, false, true);
                
                // skip this target if no collision
                if (!tmp_line_collision[0]) continue;
                
                // avoidance failed if self is inside circle,
                // else, use the first available intersection point
                var intersection = tmp_line_collision[1];
                var pt = [];
                if (intersection[0] && intersection[1])
                    pt = intersection[1];
                else {
                    nearest_circle = null;
                    break;
                }
                    
                // record target's circle if collision is nearer
                var cur_dist = Pathfinder.distance_to(pt, c);
                if (tmp_dist > cur_dist) {
                    tmp_dist = cur_dist;
                    nearest_circle = circle;
                    line_collision = tmp_line_collision;
                    target_avoided = target;
                }
            }
            
            // no target is a collision threat
            // (if debug, send some data)
            if (!nearest_circle)
                if (debug) return [1, sight];
                else return 1;

            // create a ray starting from sight's start
            var ray = new RayCast(sight.get_pos(), sight.get_rot());

            // edge case: ray is intersecting circle's center
            var cc_dir = Pathfinder.direction_to(
                sight.get_pos(),
                nearest_circle.get_center(),
                false
            );

            // offset ray by very tiny amount
            if (ray.rot == cc_dir)
                ray.rot += 0.0001;
            
            // calculate another collision with the ray instead
            var ray_collision = Collision_Detector.collides_circle_ray(nearest_circle, ray, true, false);
            var closest = ray_collision[1]; // closest pt on ray to circle's center
            var distance = ray_collision[2]; // distance from above pt to circle's center
            var intersection = line_collision[1]; // intersection data [bool, 1st pt/null, 2nd pt/null]
            
            // if agent outside of circle and smart apply specified
            // and if inside of circle and smart apply specified...do nothing
            if (intersection[1] && apply_type == 2) {
                
                // apply turn to agent (turn to closest edge point from 'closest')
                if (distance) {
                    var edge_pt = Collision_Detector._pt_on_circumference(
                                    nearest_circle, closest, null, distance);
                    unit.turn_to(edge_pt, false);
                }

                // determine deceleration amount (if self is too close)
                if (tmp_dist <= sight_mult) {
                    //var decel = Pathfinder.distance_to(intersection[1], sight.get_end());
                    var decel = 1 / (distance * distance);
                    decel *= weight;
                    if (decel > sight_mult)
                        decel = sight_mult;
                    decel *= -1;
                    if (decel + unit.get_speed() < 0)
                        decel = unit.get_speed() + decel;
                    unit.apply_impulse(decel);
                }
            }

            // if apply type is normal, get avoidance vector (and apply if specified)
            else if (apply_type < 2) {
                var vec = Nickel.UTILITY.subtract_vector(closest, nearest_circle.get_center());
                vec = Nickel.UTILITY.normalize_vector(vec);
                vec[0] *= unit.get_speed() * weight;
                vec[1] *= unit.get_speed() * weight;

                // apply if needed
                if (apply_type == 1) unit.set_velocity(vec);
            }
            
            // return 2 if agent attempted to avoid future collision
            // (if debug, return debugging data items as well)
            // (if apply_type < 2, also return steering vector)
            if (debug) {
                var info = [2, sight, nearest_circle,
                            [line_collision[0], ray_collision[1],
                             ray_collision[2], line_collision[1]]
                           ];
                if (apply_type < 2)
                    info.push(vec);
                info.push(target_avoided);
                return info;
            } else if (apply_type < 2) {
                return vec;
            } else {
                return 2;
            }
        }
    }

}//end locomotive builder



////////////////////////////////////////////
///   PARTICLE BUILDER   /////////////////// TODO: CLEAN UP OLD SETUP
////////////////////////////////////////////
var ParticleBuilder = {

    TYPES : {
        RECTANGLE : 1,
        ELLIPSE   : 2,
        IMAGE     : 3
    },

    // utilizes: context, max-lifetime (ms), body type (shape or img), image
    //           details (if type is img), stroke details (if type is shape).
    //
    // does:     Creates base features essential to all particles regardless
    //           of the parameters. This includes various variables, a body,
    //           maximum lifetime, and the update, draw, move, and update_more
    //           functions.
    //
    // *** THE FOLLOWING IS A NOTE FOR A PREVIOUS VERSION ***
    // note:     Here is a list of all possible features and how they are expected
    //           to be stored in the particle_data:   (underscores omitted) 
    //
    //           For both image and shape bod types:
    //           - lifetime                                 n milliseconds
    //           - lifetime variation                       (n0, n1)
    //           - original body size                       (w,h)
    //           - start position                           (x,y)
    //           - start position variation                 [(x0,x1),(y0,y1)]
    //           - start rotation                           n degrees
    //           - start rotation variation                 (n0,n1)
    //           - start scale                              (sx,sy)
    //           - start scale variation                    [(sx0,sx1),(sy0,sy1)]
    //           - start opacity                            n float
    //           - start opacity variation                  (n0,n1)
    //           - velocity                                 (x,y)
    //           - velocity variation                       [(x0,x1),(y0,y1)]
    //           - angular velocity                         n degrees
    //           - angular velocity variation               (n0,n1)
    //           - scale velocity                           (sx,sy)
    //           - scale velocity variation                 [(sx0,sx1),(sy0,sy1)]
    //           - opacity velocity                         n float
    //           - opacity velocity variation               (n0,n1)
    //           - acceleration                             (x,y)
    //           - acceleration variation                   [(x0,x1),(y0,y1)]
    //           - angular acceleration                     n degrees
    //           - angular acceleration variation           (n0,n1)
    //           - scale acceleration                       (sx,sy)
    //           - scale acceleration variation             [(sx0,sx1),(sy0,sy1)]
    //           - opacity acceleration                     n float
    //           - opacity acceleration variation           (n0,n1)
    //
    //           For shape body type only:
    //           - stroke color                             (r,g,b,a) int, int, int, float
    //           - start color variation                    [(r0,r1),(g0,g1),(b0,b1),(a0,a1)]
    //           - stroke fill                              (r,g,b,a) int, int, int, float
    //           - start fill variation                     [(r0,r1),(g0,g1),(b0,b1),(a0,a1)]
    //           - stroke width                             number n
    //           - start width variation                    (n0,n1)
    //           - color velocity                           (r,g,b,a) int, int, int, float
    //           - color velocity variation                 [(r0,r1),(g0,g1),(b0,b1),(a0,a1)]
    //           - fill velocity                            (r,g,b,a) int, int, int, float
    //           - fill velocity variation                  [(r0,r1),(g0,g1),(b0,b1),(a0,a1)]
    //           - width velocity                           number n
    //           - width velocity variation                 (n0,n1)
    //           - color acceleration                       (r,g,b,a) int, int, int, float
    //           - color acceleration variation             [(r0,r1),(g0,g1),(b0,b1),(a0,a1)]
    //           - fill acceleration                        (r,g,b,a) int, int, int, float
    //           - fill acceleration variation              [(r0,r1),(g0,g1),(b0,b1),(a0,a1)]
    //           - width acceleration                       number n
    //           - width acceleration variation             (n0,n1)
    create_base : function(particle, system, data) {

        // set properties
        particle.id = Nickel.UTILITY.assign_id();
        particle.type = 'Particle';
        particle.sys = system;
        particle.funcs = []; // list of private behaviours

        particle.collidable = false;
        particle.dead = false;
        particle.time_past = 0; // time past so far
        particle.time_start = Date.now();

        // ceate body of particle
        if (data.image) {
            particle.image = new Image();
            particle.image.src = data.image;
            particle.body = ParticleBuilder.TYPES.IMAGE;
        } else if (data.shape) {
            particle.body = data.shape;
        } else {
            particle.body = ParticleBuilder.TYPES.RECTANGLE; //default
        }

        // gets particle position relative to the canvas (not the particle system)
        // * note: does not support rotation or scaling of the particle system *
        particle.get_canvas_pos = function() {
            return Nickel.v2d.add(particle.pos, particle.sys.pos);
        }

        // sets particle position relative to the canvas (not the particle system)
        // * note: does not support rotation or scaling of the particle system *
        particle.set_canvas_pos = function(pos) {
            particle.pos = Nickel.v2d.sub(pos, particle.sys.pos);
        }

        // allows to add a private variable to a single particle
        particle.add_attr = function(name, value) {
            particle[name] = value;
        }

        // allows to add a private functionality to a single particle
        particle.add_func = function(f) {
            particle.funcs.push(f);
        }

        // inits the particle
        // - can result in unique particles with the same code
        particle.init = function() {
            particle.sys.apply_init_features(particle);
        }

        // create update function
        // - updates the image of the body
        particle.update = function() {

            // check death condition
            if (particle.dead)
                return;

            particle.update_before();

            // update pseudo timer
            // get the amount of milliseconds that have past so far
            particle.time_past = Date.now() - particle.time_start;

            // skip if lifetime is up
            if (particle.time_past >= particle.lifetime) {
                particle.dead = true;
                return;
            }

            // update all movement
            particle.move();

            // custom update
            particle.update_more();

            // draws image of body
            particle.draw();
        }

        // create draw function
        // - draws image of body
        particle.draw = function() {
            particle.sys.context.save();
            particle.sys.apply_draw_features(particle);
            particle.sys.context.restore();
        }

        // create move function
        // - moves image of body
        // - applies any private behaviour as well
        particle.move = function() {
            particle.sys.apply_move_features(particle);
            for (var i in particle.funcs)
                particle.funcs[i](particle);
        }

        // create update_before/more function
        // - allows for custom update add-ons by user
        particle.update_before = function() {}
        particle.update_more = function() {}
    }

    ,

    // creates variables and puts'em into the ptc (particle object)
    // creates functions and puts'em into the system's feature list
    // note: rounds to 6 decimal places
    // features:
    //      time_total      num                 lifetime of particle (milliseconds)
    //      size            [num,num]           size of particle (w,h)
    //      pos             [num,num]           position of particle (x,y)
    //      rot             num                 angle of particle (degrees)
    //      scale           [num,num]           scale of particle (w,h)
    //      op              num                 opacity/transparency of particle (0 to 1)
    //      fill            [num,num,num,num]   fill color of particle [r,g,b,alpha]
    //      color           [num,num,num,num]   border color of particle [r,g,b,alpha]
    //      strw            num                 stroke width of particle border
    //
    //  TODO: OPTIMIZE (CHECK FIRST IF PARTICLE NEEDS TO ROTATE/SCALE/TRANSLATE or SOMETHING)
    create_features : function(particle, system, data) {

        // lifetime
        system.add_init_feature(function(particle) {
            particle.lifetime = Infinity;
        });

        // size
        system.add_init_feature(function(particle) {
            particle.size = [8,8]; // (default 8x8 rect)
        });

        // pos
        system.add_init_feature(function(particle) {
            particle.pos = [0,0]; // default start position 0,0
        });

        // rot
        if (data.enable_rotation)
            system.add_init_feature(function(particle) {
                particle.rot = 0; // default start rotation 0 degrees
            });

        // scale
        if (data.enable_scaling)
            system.add_init_feature(function(particle) {
                particle.scale = [1,1]; // default start scale 1,1
            });

        // opacity
        if (data.enable_transparency)
            system.add_init_feature(function(particle) {
                particle.opacity = 1;
            });

        // draw translation*, rotation*, scale*, opacity*, image/ellipse/rect features: (*=optional)
        var ctx = system.context;
        if (particle.body == ParticleBuilder.TYPES.ELLIPSE) {
            if (data.enable_translation) {
                if (data.enable_rotation) {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.pos[0],
                                      particle.pos[1]);
                        ctx.rotate(particle.rot);
                    });
                } else {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.pos[0],particle.pos[1]);
                    });
                }
            } else if (data.enable_rotation) {
                system.add_draw_feature(function(particle){
                    ctx.rotate(particle.rot);
                });
            }
            if (data.enable_scaling) {
                system.add_draw_feature(function(particle){
                    ctx.scale(particle.scale[0], particle.scale[1]);
                });
            }
            if (data.enable_transparency) {
                system.add_draw_feature(function(particle){
                    // bound opacity
                    if (particle.opacity < 0) particle.opacity = 0;
                    else if (particle.opacity > 1) particle.opacity = 1;
                    // set opacity
                    ctx.globalAlpha = particle.opacity;
                });
            }
            system.add_draw_feature(function(particle){
                ctx.imageSmoothingEnabled = system.scene.antialias; // copy antialiasing property
                ctx.beginPath();
                ctx.ellipse(0, 0,
                            particle.size[0],
                            particle.size[1],
                            0, 0,
                            2 * Math.PI);
            });

        } else if (particle.body == ParticleBuilder.TYPES.RECTANGLE) {
            if (data.enable_translation) {
                if (data.enable_rotation) {
                    if (data.enable_scaling) {
                        system.add_draw_feature(function(particle){
                            ctx.translate(particle.pos[0],
                                          particle.pos[1]);
                            ctx.rotate(particle.rot);
                            ctx.translate(-particle.size[0]*particle.scale[0]/2,
                                          -particle.size[1]*particle.scale[1]/2);
                        });
                    } else {
                        system.add_draw_feature(function(particle){
                            ctx.translate(particle.pos[0],
                                          particle.pos[1]);
                            ctx.rotate(particle.rot);
                            ctx.translate(-particle.size[0]/2,  ///??? NOT TESTED YET >HERE!
                                          -particle.size[1]/2); ///??? NOT TESTED YET >HERE!
                        });
                    }
                } else {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.pos[0],particle.pos[1]);
                    });
                }
            } else if (data.enable_rotation) {
                if (data.enable_scaling) {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.size[0]*particle.scale[0]/2,
                                      particle.size[1]*particle.scale[1]/2);
                        ctx.rotate(particle.rot);
                        ctx.translate(-particle.size[0]*particle.scale[0]/2,
                                      -particle.size[1]*particle.scale[1]/2);
                    });
                } else {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.size[0]/2,    ///??? NOT TESTED YET >HERE!
                                      particle.size[1]/2);   ///??? NOT TESTED YET >HERE!
                        ctx.rotate(particle.rot);
                        ctx.translate(-particle.size[0]/2,   ///??? NOT TESTED YET >HERE!
                                      -particle.size[1]/2);  ///??? NOT TESTED YET >HERE!
                    });
                }
            }
            if (data.enable_scaling) {
                system.add_draw_feature(function(particle){
                    ctx.scale(particle.scale[0], particle.scale[1]);
                });
            }
            if (data.enable_transparency) {
                system.add_draw_feature(function(particle){
                    // bound opacity
                    if (particle.opacity < 0) particle.opacity = 0;
                    else if (particle.opacity > 1) particle.opacity = 1;
                    // set opacity
                    ctx.globalAlpha = particle.opacity;
                });
            }
            system.add_draw_feature(function(particle){
                ctx.imageSmoothingEnabled = system.scene.antialias; // copy antialiasing property
                ctx.beginPath();
                ctx.rect(0, 0,
                         particle.size[0],
                         particle.size[1]);
            });

        } else { //(image)
            if (data.enable_translation) {
                if (data.enable_rotation) {
                    if (data.enable_scaling) {
                        system.add_draw_feature(function(particle){
                            ctx.translate(particle.pos[0],
                                          particle.pos[1]);
                            ctx.rotate(particle.rot);
                            ctx.translate(-particle.size[0]*particle.scale[0]/2,
                                          -particle.size[1]*particle.scale[1]/2);
                        });
                    } else {
                        system.add_draw_feature(function(particle){
                            ctx.translate(particle.pos[0],
                                          particle.pos[1]);
                            ctx.rotate(particle.rot);
                            ctx.translate(-particle.size[0]/2,      ///??? NOT TESTED YET >HERE!
                                          -particle.size[1]/2);     ///??? NOT TESTED YET >HERE!
                        });
                    }
                } else {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.pos[0],particle.pos[1]);
                    });
                }
            } else if (data.enable_rotation) {
                if (data.enable_scaling) {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.size[0]*particle.scale[0]/2,
                                      particle.size[1]*particle.scale[1]/2);
                        ctx.rotate(particle.rot);
                        ctx.translate(-particle.size[0]*particle.scale[0]/2,
                                      -particle.size[1]*particle.scale[1]/2);
                    });
                } else {
                    system.add_draw_feature(function(particle){
                        ctx.translate(particle.size[0]/2,       ///??? NOT TESTED YET >HERE!
                                      particle.size[1]/2);      ///??? NOT TESTED YET >HERE!
                        ctx.rotate(particle.rot);
                        ctx.translate(-particle.size[0]/2,      ///??? NOT TESTED YET >HERE!
                                      -particle.size[1]/2);     ///??? NOT TESTED YET >HERE!
                    });
                }
            }
            if (data.enable_scaling) {
                system.add_draw_feature(function(particle){
                    ctx.scale(particle.scale[0], particle.scale[1]);
                });
            }
            if (data.enable_transparency) {
                system.add_draw_feature(function(particle){
                    // bound opacity
                    if (particle.opacity < 0) particle.opacity = 0;
                    else if (particle.opacity > 1) particle.opacity = 1;
                    // set opacity
                    ctx.globalAlpha = particle.opacity;
                });
            }
            system.add_draw_feature(function(particle){
                ctx.imageSmoothingEnabled = system.scene.antialias; // copy antialiasing property
                ctx.drawImage(particle.image, 0, 0,
                              particle.size[0],
                              particle.size[1]);
            });
        }//end shared draw features

        // shape unique features
        if (data.type != ParticleBuilder.TYPES.IMAGE) {

            // fill color
            if (data.enable_fill)
                system.add_init_feature(function(particle) {
                    particle.fill = [0,0,0,1];
                });

            // stroke color, width
            if (data.enable_stroke)
                system.add_init_feature(function(particle) {
                    particle.color = [0,0,0,1];
                    particle.strw = 1;
                });

            //
            //  Paint
            //

            // paint helper
            var _bound_rgba = function(vec_4){
                if (vec_4[0] < 0) vec_4[0] = 0;
                else if (vec_4[0] > 255) vec_4[0] = 255;
                if (vec_4[1] < 0) vec_4[1] = 0;
                else if (vec_4[1] > 255) vec_4[1] = 255;
                if (vec_4[2] < 0) vec_4[2] = 0;
                else if (vec_4[2] > 255) vec_4[2] = 255;
                if (vec_4[3] < 0) vec_4[3] = 0;
                else if (vec_4[3] > 1) vec_4[3] = 1;
            }
            var _bound_hsla = function(vec_4){
                if (vec_4[0] < 0 || isNaN(vec_4[0])) vec_4[0] = 0;
                else if (vec_4[0] > 360) vec_4[0] = 360;
                if (vec_4[1] < 0) vec_4[1] = 0;
                else if (vec_4[1] > 100) vec_4[1] = 100;
                if (vec_4[2] < 0) vec_4[2] = 0;
                else if (vec_4[2] > 100) vec_4[2] = 100;
                if (vec_4[3] < 0) vec_4[3] = 0;
                else if (vec_4[3] > 1) vec_4[3] = 1;
            }

            // draw fill color*, stroke width*, stroke color* features: (*=optional)
            if (data.enable_fill) {
                system.add_draw_feature(function(particle){
                    // round and bound fill color
                    if (system.clr_space == 'hsla') {
                        // (don't need to round)
                        var tmp_color = [particle.fill[0],
                                         particle.fill[1]*100,
                                         particle.fill[2]*100,
                                         particle.fill[3]];
                        _bound_hsla(tmp_color);
                        ctx.fillStyle = 'hsla('+ tmp_color[0] + ','
                                            + tmp_color[1] + '%,'
                                            + tmp_color[2] + '%,'
                                            + tmp_color[3] + ')';
                    } else {
                        var tmp_color = [Math.round(particle.fill[0]),
                                        Math.round(particle.fill[1]),
                                        Math.round(particle.fill[2]),
                                        particle.fill[3]];
                        _bound_rgba(tmp_color);
                        ctx.fillStyle = 'rgba('+ tmp_color[0] + ','
                                            + tmp_color[1] + ','
                                            + tmp_color[2] + ','
                                            + tmp_color[3] + ')';
                    }

                    // copy antialiasing property
                    ctx.imageSmoothingEnabled = system.scene.antialias;
                    
                    // fill
                    ctx.fill();
                });
            }
            if (data.enable_stroke) {
                system.add_draw_feature(function(particle){
                    ctx.lineWidth = particle.strw;
                    // round and bound stroke color
                    if (system.clr_space == 'hsla') {
                        // (don't need to round)
                        var tmp_color = [particle.color[0],
                                         particle.color[1]*100,
                                         particle.color[2]*100,
                                         particle.color[3]];
                        _bound_hsla(tmp_color);
                        ctx.strokeStyle = 'hsla('+ tmp_color[0] + ','
                                            + tmp_color[1] + '%,'
                                            + tmp_color[2] + '%,'
                                            + tmp_color[3] + ')';
                    } else {
                        var tmp_color = [Math.round(particle.color[0]),
                                        Math.round(particle.color[1]),
                                        Math.round(particle.color[2]),
                                        particle.color[3]];
                        _bound_rgba(tmp_color);
                        ctx.strokeStyle = 'rgba('+ tmp_color[0] + ','
                                                + tmp_color[1] + ','
                                                + tmp_color[2] + ','
                                                + tmp_color[3] + ')';
                    }
                    
                    // copy antialiasing property
                    ctx.imageSmoothingEnabled = system.scene.antialias;
                    
                    // stroke (borders only)
                    ctx.stroke();
                });
            }
        }//end if shape
    }

}



////////////////////////////////////////////
///   PARTICLE SYSTEM BUILDER   ////////////
////////////////////////////////////////////
var ParticleSystemBuilder = {

    TYPES : {
        CUSTOM : 0,
        FIRE : 1,
        WATER : 2,
        SMOKE : 3,
        JET : 4,
        EXPLOSION : 5,
        SPIRAL : 6,
        PULSE : 7
    },

    // utilizes: Type of system to be created.
    //
    // does:     Determines what kind of particle system to create
    //           and creates accordingly.
    create : function(sys, data) {

        // usual stuff
        sys.id = Nickel.UTILITY.assign_id();
        sys.type = 'ParticleSystem';
        sys.parameters = data;
        sys.visible = true;
        sys.parent = null; // useful for behaving relatively to some object

        // usual funcs
        sys.show = function() {sys.visible = true;}
        sys.hide = function() {sys.visible = false;}

        // copy stuff
        // TODO: DOESN'T WORK AS OF YET?
        sys.copy = function() {
            var obj = new ParticleSystem(sys.parameters);
            obj.parent = sys.parent;
            obj.pos = sys.pos.slice(0);
            obj.rot = sys.rot;
            obj.scale = sys.scale.slice(0);
            obj.period = sys.period;
            obj.amount = sys.amount
            if (sys.period_variation)
            	obj.period_variation = sys.period_variation.slice(0);
            obj.period_bounds = sys.period_bounds.slice(0);
            if (sys.create_amount_var)
            	obj.create_amount_var = sys.create_amount_var.slice(0);
            obj.amount_bounds = sys.amount_bounds.slice(0);
            obj.init_features = sys.init_features.slice(0);
            obj.draw_features = sys.draw_features.slice(0);
            obj.move_features = sys.move_features.slice(0);
            //obj.update_before = sys.update_before;
            //obj.update_more = sys.update_more;
            return obj;
        }

        // create
        switch (data.type) {
            case ParticleSystemBuilder.TYPES.FIRE:
                ParticleSystemBuilder.create_fire(sys, data);
                break;
            case ParticleSystemBuilder.TYPES.WATER:
                ParticleSystemBuilder.create_water(sys, data);
                break;
            case ParticleSystemBuilder.TYPES.SMOKE:
                ParticleSystemBuilder.create_smoke(sys, data);
                break;
            case ParticleSystemBuilder.TYPES.JET:
                ParticleSystemBuilder.create_jet(sys, data);
                break;
            case ParticleSystemBuilder.TYPES.EXPLOSION:
                ParticleSystemBuilder.create_explosion(sys, data);
                break;
            case ParticleSystemBuilder.TYPES.SPIRAL:
                ParticleSystemBuilder.create_spiral(sys, data);
                break;
            case ParticleSystemBuilder.TYPES.PULSE:
                ParticleSystemBuilder.create_pulse(sys, data);
                break;
            default:
                ParticleSystemBuilder.create_custom(sys, data);
        }
    },

    // utilizes: scene, particle_data, lifetime (ms),
    //           initial position, initial rotation, initial scale,
    //           create_period (ms), create_amount
    //
    // does:     Assigns various variables to the particle system. A
    //           base particle is also set up using the given parameters.
    //           The system's update, draw, update_more, and transformation
    //           functions are also added.
    create_custom : function(sys, data) {
        // this canvas will be a buffer; i.e. all particles
        // will be painted onto this first, then global
        // transformations will be applied, then finally the
        // buffer will be painted onto the main context as
        // an image
        sys.buffer = document.createElement('canvas');
        sys.buffer.width = data.scene.get_w();
        sys.buffer.height = data.scene.get_h();
        sys.context = sys.buffer.getContext('2d');
        sys.scene = data.scene;

        // create lifetime feature just like the
        // particles themselves
        sys.time_past = 0; // time past so far
        sys.time_total = data.lifetime_mseconds;
        if (!sys.time_total) sys.time_total = 999999999; // default ~12 earth days
        sys.time_start = Date.now();
        sys.dead = false;
        sys.paused = false;

        // default color space
        sys.clr_space = 'rgba';

        // get/set the color space
        sys.get_color_space = () => sys.clr_space;
        sys.set_color_space = (space) => sys.clr_space = space;

        // resets lifetime to a new amount
        sys.set_lifetime = function(milliseconds) {
            sys.time_total = milliseconds;
            sys.time_past = 0;
            sys.time_start = Date.now();
        }

        // particle creation control functions
        sys.pause_emission = function() {sys.paused = true;}
        sys.resume_emission = function() {sys.paused = false;}
        sys.is_emission_paused = function() {return sys.paused;}

        // particle control functions (affects each particle)
        sys.apply_to_all = function(f) {
            var _tmp_ptcs = sys.queue.data();
            for (var i in _tmp_ptcs)
                f(_tmp_ptcs);
        }

        // this queue holds all the particles in
        // order from youngest to oldest
        sys.queue = new Queue();

        // transformation related properties
        sys.pos   = [data.position[0], data.position[1]];
        sys.rot   = data.rotation * Math.PI / 180;
        sys.scale = [data.scale[0], data.scale[1]];

        // particle creation vars
        sys.period = data.create_period_mseconds;
        sys.amount = data.create_amount;
        sys.last_created = sys.time_start - sys.period;

        // (*optional) variation and max of period
        if (data.create_period_var)
            sys.period_variation = [Math.round(data.create_period_var[0]),
                                    Math.round(data.create_period_var[1])];
        if (data.create_period_bounds)
            sys.period_bounds = [data.create_period_bounds[0],
                                 data.create_period_bounds[1]];
        else
            sys.period_bounds = [1,9999999];

        // (*optional) variation and max of amount
        if (data.create_amount_var)
            sys.amount_variation = [Math.round(data.create_amount_var[0]),
                                    Math.round(data.create_amount_var[1])];
        if (data.create_amount_bounds)
            sys.amount_bounds = [data.create_amount_bounds[0],
                                 data.create_amount_bounds[1]];
        else
            sys.amount_bounds = [1,9999999];

        // feature preservation
        sys.init_features = [];
        sys.draw_features = [];
        sys.move_features = [];

        // create update function
        // - updates all particles in the system
        sys.update = function() {

            // check death condition
            if (sys.dead || !sys.visible)
                return;

            // update custom add-ons
            sys.update_before();

            // get current time in milliseconds
            var now = Date.now()

            // update pseudo timer
            // get the amount of milliseconds that have past so far
            sys.time_past = now - sys.time_start;

            // skip if lifetime is up
            if (sys.time_past >= sys.time_total) {
                sys.dead = true;
                return;
            }

            // create new particles if next period reached
            if (sys.period <= now - sys.last_created && !sys.paused) {
                sys.last_created = now;
                for (var i=0; i<sys.amount; i++) {
                    var particle = new Particle(data.particle_data, sys);
                    particle.init();
                    sys.queue.in(particle);
                }

                // random shift of period
                if (sys.period_variation) {
                    sys.period += Nickel.UTILITY.random_number(sys.period_variation[0],
                                                               sys.period_variation[1]);
                    if (sys.period <= sys.period_bounds[0]) sys.period = sys.period_bounds[0];
                    else if (sys.period > sys.period_bounds[1]) sys.period = sys.period_bounds[1];
                }

                // random shift of amount
                if (sys.amount_variation) {
                    sys.amount += Nickel.UTILITY.random_number(sys.amount_variation[0],
                                                               sys.amount_variation[1]);
                    if (sys.amount <= sys.amount_bounds[0]) sys.amount = sys.amount_bounds[0];
                    else if (sys.amount > sys.amount_bounds[1]) sys.amount = sys.amount_bounds[1];
                }
            }

            // remove (next) dead particles
            // /!\ warning: if an old particle is lingering,
            //     dead particles before will also linger. /!\
            while (sys.queue.next() && sys.queue.next().dead)
                sys._on_particle_removed(sys.queue.out());

            // update all queued particles (also preform transformations first)
            var ctx = sys.context;
            ctx.save();

            // copy antialiasing property
            ctx.imageSmoothingEnabled = sys.scene.antialias;

            ctx.translate(sys.pos[0], sys.pos[1]);
            ctx.rotate(sys.rot);
            ctx.scale(sys.scale[0], sys.scale[1]);
            // updates
            var _tmp_ptcs = sys.queue.data();
            for (var i in _tmp_ptcs)
                _tmp_ptcs[i].update();
            ctx.restore();

            // update custom add-ons
            sys.update_more();

            // update image/transformations
            sys.draw();
        }

        // create draw function
        // - transforms/renders image of buffer
        //   onto the main canvas
        sys.draw = function() {

            var ctx0 = sys.scene.context; //original
            var ctx = sys.context; //buffer
            ctx.save();

            // copy antialiasing property
            ctx0.imageSmoothingEnabled = sys.scene.antialias;

            ctx0.drawImage(sys.buffer,
                           0, 0,
                           sys.buffer.width,
                           sys.buffer.height);
            ctx.clearRect(0,0,sys.buffer.width,sys.buffer.height);
            ctx.restore();
        }

        // create update_before/more function
        // - allows for custom update add-ons by user
        sys.update_before = function() {}
        sys.update_more = function() {}

        // flags system as dead
        sys.destroy = function() {
            sys.dead = true;
        }

        // particle destruction behavior
        // /!\ warning: only meant to be used by developers. /!\
        sys._on_particle_removed = function(ptc) {

            //... override
        }

        // feature management functions: (applies to all particles)
        // - manages initialization, movement, and drawing
        //   of particles to an extent
        sys.add_init_feature = function(feature) {
            sys.init_features.push(feature);
        }

        sys.add_draw_feature = function(feature) {
            sys.draw_features.push(feature);
        }

        sys.add_move_feature = function(feature) {
            sys.move_features.push(feature);
        }

        sys.apply_init_features = function(particle) {
            for(var i in sys.init_features) {
                sys.init_features[i](particle); // run each feature function (once in init)
            }
        }

        sys.apply_draw_features = function(particle) {
            for(var i in sys.draw_features) {
                sys.draw_features[i](particle); // run each feature function (every draw)
            }
        }

        sys.apply_move_features = function(particle) {
            for(var i in sys.move_features) {
                sys.move_features[i](particle); // run each feature function (every move)
            }
        }

        // system transformation functions
        sys.translate = function(dx,dy) {
            //TODO
        }

        sys.rotate = function(degs,origin) {
            //TODO
        }

        sys.zoom = function(sx,sy) {
            //TODO
        }

        //
        // Post creation inits:
        //

        // create features of this system's particles
        var template_particle = new Particle(data.particle_data, sys);
        ParticleBuilder.create_features(template_particle, sys, data.particle_data);
    },

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_fire : function() {/*TODO*/},

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_water : function() {/*TODO*/},

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_smoke : function() {/*TODO*/},

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_jet : function() {/*TODO*/},

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_explosion : function() {/*TODO*/},

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_spiral : function() {/*TODO*/},

    // utilizes: Same as custom.
    //
    // does:     Same as custom, except the base particle data will be altered
    //           to forcively match this type of particle system. User will
    //           be able to override only some parameters of the particle data.
    create_pulse : function() {/*TODO*/}

}
//*/
