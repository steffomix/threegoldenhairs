/*
 * Copyright (C) 06.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'noise', 'tileDefinitions'],
    function (config, Logger, noise, tileDefinitions) {

        var instance,
            logger = Logger.getLogger('worldGenerator');
        logger.setLevel(config.logger.worldGenerator || 0);


        var scale = 10,
            noiseRanges = [
                0,
                100, // Water
                115, // sand
                160, // grass
                190, // wood
                220, // stone
                256 // snow
            ],
            tiles = tileDefinitions.worldGenerator();

        function scaleNoise(s) {
            return s * scale;
        }

        function calcNoise(x, y, s) {
            var value = Math.min(Infinity, Math.max(-Infinity, noise.simplex2(x / scaleNoise(s), y / scaleNoise(s), 0)));
            return (1 + value) * 1.1 * 128;
        }

        function WorldGenerator() {

            this.tile = function(x, y) {
                var value = calcNoise(x, y, 10) / 2;
                value += calcNoise(y, x, 5) / 4;
                value += calcNoise(x, y, 2.5) / 8;
                value += calcNoise(y, x, 1) / 8;
                value = Math.min(255, value);

                for (var i = 0; i < noiseRanges.length - 1; i++) {
                    if (value >= noiseRanges[i] && value < noiseRanges[i + 1]) {
                        return tiles[i];
                    }
                }
                logger.error('GameFloor::drawTile not in Range', value, noiseRanges);
            };


        }

        function getInstance() {
            if (!instance) {
                instance = new WorldGenerator();
            }
            return instance;
        }

        return getInstance();

    });