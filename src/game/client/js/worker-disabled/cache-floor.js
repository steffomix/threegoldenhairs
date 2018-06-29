/*
 * Copyright (C) 15.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'underscore', 'workerSocket', 'workerRouter', 'server'],
    function (config, Logger, _, workerSocket, router, server) {

        var logger = Logger.getLogger('floor');
        logger.setLevel(config.logger.floor || 0);


        function Floor(data) {
            this.world_id = data.world_id;
            this.area_id = data.area_id;
            this.z = data.z;
            this.rawTiles = data.tiles;
            this.tiles = {};
            this.updateAllTiles(data.tiles);
        }

        Floor.prototype = {
            updateAllTiles: function(tiles){
                _.each(tiles, this.computeTile, this);
                this.sendFloor();
            },
            sendFloor: function(){
                var data = {
                    world_id: this.world_id,
                    area_id: this.area_id,
                    z: this.z,
                    tiles: this.rawTiles
                };
                workerSocket.send('game.updateFloor', data);
            },
            computeTile: function(tile){

            }
        };

        return Floor;

    });

