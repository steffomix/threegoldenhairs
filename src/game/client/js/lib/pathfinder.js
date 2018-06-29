/*
 * Copyright (C) 09.01.17 Stefan Brinkmann <steffomix@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

define(['config', 'logger', 'underscore', 'easystar', 'pathfinding', 'worldGenerator'],
    function (config, Logger, _, Easystar, pathfinding, worldGenerator) {

        var pathfinder = new pathfinding.AStarFinder({
                allowDiagonal: true
            }),
            logger = Logger.getLogger('workerPathfinder');
        logger.setLevel(config.logger.workerPathfinder || 0);





        var WorkerPathfinder = function(p1, p2, extend){


            // enlarge grid around min and max values
            var extendGrid = extend || 10;

            // matrix bounds
            var xMin = Math.min(p1.x, p2.x),
                xMax = Math.max(p1.x, p2.x),
                yMin = Math.min(p1.y, p2.y),
                yMax = Math.max(p1.y, p2.y);


            // fix worker stuck on fast moves
            if((xMax - xMin) * (yMax - yMin) < 2500){
                this.find = find;
            }else{
                // too much tiles may occur on very fast moves or teleports
                this.find = function(){
                    return [];
                }
                return;
            }

            var width = xMax - xMin,
                height = yMax - yMin,
                xOffset = 0,
                yOffset = 0,
                matrix = [];

            // calculate offset
            // shift real grid positions to matrix positions
            if (xMin < 0) {
                xOffset = xMin * -1;
            }
            if (xMax > width) {
                xOffset = (xMax - width) * -1;
            }
            if (yMin < 0) {
                yOffset = yMin * -1;
            }
            if (yMax > height) {
                yOffset = (yMax - height) * -1;
            }


            var finder = new Easystar.js();
            finder.enableSync();
            finder.enableDiagonals();
            finder.setGrid(createMatrix());

            var x1 = p1.x + xOffset + extendGrid, x2 = p2.x + xOffset + extendGrid,
                y1 = p1.y + yOffset + extendGrid, y2 = p2.y + yOffset + extendGrid;

            function find(){

                var foundPath = false;
                finder.findPath(x1, y1, x2, y2, function(path){
                    foundPath = path;
                });
                var c = 0;
                while(c++ < 1000 && !foundPath){
                    finder.calculate();
                }

                var path = foundPath || [],
                    finalPath = [],
                    step1, step2,
                    speed1, speed2,
                    distance;

                for(var i = 1; i < path.length; i++){
                    step1 = path[i - 1];
                    step2 = path[i];

                    x1 = path[i - 1].x;
                    y1 = path[i - 1].y;

                    x2 = path[i].x;
                    y2 = path[i].y;

                    try{
                        speed1 = matrix[y1][x1];
                        speed2 = matrix[y2][x2];
                    }catch(e){
                        logger.error(e);
                    }

                    distance = Math.abs(step1.x - step2.x) + Math.abs(step1.y - step2.y);
                    finalPath.push({
                        x: path[i].x - xOffset - extendGrid,
                        y: path[i].y - yOffset - extendGrid,
                        speed: distance < 2
                            ? (speed1 + speed2) / 2 // straight
                            : ((speed1 + speed2) / 2) * 1.4, // diagonal
                        origSpeed: speed1
                    });

                }
                return finalPath;
            };



            function createMatrix() {

                // create base matrix and collect walk speeds
                var row;
                for (var y = yMin - extendGrid; y <= yMax + extendGrid; y++) {
                    row = [];
                    for (var x = xMin - extendGrid; x <= xMax + extendGrid; x++) {
                        row.push( worldGenerator.tile(x, y).walkSpeed);
                    }
                    matrix.push(row);
                }
                return matrix;
            }
        };


        return WorkerPathfinder;

    });