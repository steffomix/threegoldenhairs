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

define(['config', 'logger', 'pixi', 'gamePosition'],
    function (config, Logger, pixi, position) {

        var logger = Logger.getLogger('gameTile');
        logger.setLevel(config.logger.gameTile || 0);

        function GameTile(tileDefinition) {
            pixi.Container.call(this);
            var sprite = new pixi.Sprite(pixi.Texture.fromImage('assets/tiles/' + tileDefinition.texture + '.png'));
            sprite.anchor.set(.5, .5);
            this.addChild(sprite);

            // test y z-order
            //sprite.scale.set(1, 1.1);

            this.gamePosition = position.factory(this);
        }

        GameTile.prototype = Object.create(pixi.Container.prototype);
        GameTile.prototype.constructor = GameTile;

        return GameTile;

    });