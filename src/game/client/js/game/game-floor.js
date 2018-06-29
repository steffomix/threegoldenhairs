/*
 * Copyright (C) 16.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'underscore', 'gameEvents', 'pixi', 'noise', 'gameApp', 'worldGenerator', 'gameTile'],
    function (config, Logger, _, events, pixi, noise, gameApp, worldGenerator, GameTile) {

        var logger = Logger.getLogger('gameFloor');
        logger.setLevel(config.logger.gameFloor || 0);

        var tileSize = config.game.tiles.size,
            scale = config.game.tiles.scale;


        function coord(x, y) {
            return x + '_' + y;
        }

        function GameFloor() {
            pixi.Container.call(this);
            var self = this,
                // tiles register
                tiles = {},
                // rows register
                rows = {},
                // topmost row
                minY = Infinity,
                // bottommost row
                maxY = -Infinity;

            // update gameFloor
            events.game.frameTick(function () {
                var mainPlayer = gameApp.get('mainPlayer');
                if (mainPlayer) {

                    // get current state
                    var row,
                        nTiles = {},
                        nRows = {},
                        pGrid = gameApp.get('mainPlayer').gamePosition.grid,
                        px = pGrid.x,
                        py = pGrid.y,
                        screen = gameApp.get('screen');

                    // count tiles needed
                    var nTilesWidth = Math.round(screen.width / 2 / tileSize / scale),
                        nTilesHeight = Math.round(screen.height / 2 / tileSize / scale);

                    // center offset
                    var tilesOffsetX = Math.round(screen.playerOffset.x / tileSize),
                        tilesOffsetY = Math.round(screen.playerOffset.y / tileSize);

                    if (tilesOffsetX > nTilesWidth || tilesOffsetY > nTilesHeight) {
                        // skip render on extrem fast moves
                        return;
                    }

                    // rectangle to fill with tiles
                    var lx = (px - tilesOffsetX - nTilesWidth) - 1, lxx = lx * tileSize,
                        rx = (px - tilesOffsetX + nTilesWidth) + 1, rxx = rx * tileSize,
                        ly = (py - tilesOffsetY - nTilesHeight) - 1, lyy = ly * tileSize,
                        ry = (py - tilesOffsetY + nTilesHeight) + 1, ryy = ry * tileSize;

                    if (self.children.length) {

                        // remove tiles out of view
                        _.each(tiles, function (t, k) {
                            if (t && (t.x < lxx || t.x > rxx || t.y < lyy || t.y > ryy)) {
                                t.destroy();
                                tiles[k] = null;
                            }
                        });


                        // cleanup empty rows
                        minY = Infinity;
                        maxY = -Infinity;
                        var rowKeys = Object.keys(rows),
                            row;
                        for (var i = 0; i < rowKeys.length; i++) {
                            row = rows[rowKeys[i]];
                            var y = row._y;

                            if (y < ly || y > ry) {
                                self.removeChild(row);
                                row.destroy();
                                // on very fast moves all rows may be out of range
                                if(!self.children.length){
                                    break;
                                }
                                minY = self.getChildAt(0)._y;
                            } else {
                                nRows[y] = row;
                                minY = Math.min(minY, y);
                                maxY = Math.max(maxY, y);
                            }
                        }

                        /*
                         _.each(rows, function (row) {
                         var y = row._y;

                         if (y < ly || y > ry) {
                         self.removeChild(row);
                         row.destroy();
                         minY = self.getChildAt(0)._y;
                         } else {
                         nRows[y] = row;
                         minY = Math.min(minY, y);
                         maxY = Math.max(maxY, y);
                         }

                         });
                         */

                        // replace rows register
                        rows = nRows;

                    }

                    if (!self.children.length) {
                        // create initial row
                        // there may be non exist yet
                        // or all rows are deleted due to very fast moves
                        minY = maxY = ly;
                        row = new pixi.Container();
                        row._y = ly;
                        rows[ly] = row;
                        self.addChild(row);
                    }

                    // add new tiles come into view
                    var id, tile;
                    for (var x = lx; x <= rx; x++) {
                        for (var y = ly; y <= ry; y++) {
                            id = coord(x, y);
                            if (!tiles[id]) {
                                tile = new GameTile(worldGenerator.tile(x, y));
                                nTiles[id] = tile;
                                addTile(x, y, tile);
                            } else {
                                nTiles[id] = tiles[id];
                            }
                        }
                    }
                    // replace tiles register
                    tiles = nTiles;


                }

            });


            function pushRow(y) {
                var row = new pixi.Container();
                row._y = y;
                rows[y] = row;
                self.addChild(row);
                return row;
            }

            function unshiftRow(y) {
                var childs = self.removeChildren(),
                    row = pushRow(y);
                for (var i = 0; i < childs.length; i++) {
                    self.addChild(childs[i]);
                }
            }


            function addTile(x, y, tile) {
                var i;
                if (y < minY) {
                    for (i = minY - 1; i >= y; i--) {
                        unshiftRow(i);
                    }
                    minY = y;
                }

                if (y > maxY) {
                    for (i = maxY + 1; i <= y; i++) {
                        pushRow(i);
                    }
                    maxY = y;
                }
                tile.setTransform(x * tileSize, y * tileSize);
                rows[y].addChild(tile);
            }


        }

        GameFloor.prototype = Object.create(pixi.Container.prototype);
        GameFloor.prototype.constructor = GameFloor;


        return GameFloor;
    });