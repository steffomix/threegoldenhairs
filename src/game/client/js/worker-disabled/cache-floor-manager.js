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

define(['config', 'logger', 'cacheFloor'],
    function (config, Logger, Floor) {

        var instance,
            logger = Logger.getLogger('floorManager');
        logger.setLevel(config.logger.floorManager || 0);

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new FloorManager();
            }
            return instance;
        }

        function FloorManager() {

            var floors = {};

            this.updateFloor = function(data){
                var id = locationId(data);

                if(!floors[id]){
                    floors[id] = new Floor(data);
                }else{
                    floors[id].updateAllTiles(data.tiles);
                }
            };

            this.updateTile = function(data){
                var id = locationId(data);
                if(!floors[id]){

                }
            };


            function locationId(data){
                return data.world_id + '_' + data.area_id + '_' + data.z;
            }


        }

    });