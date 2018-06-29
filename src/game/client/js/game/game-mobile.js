/*
 * Copyright (C) 01.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'debugInfo', 'pixi', 'gameLocation', 'gamePosition'],
    function (config, Logger, DebugInfo, pixi, Location, position) {

        var logger = Logger.getLogger('gameMobile');
        logger.setLevel(config.logger.gameMobile || 0);

        function Mobile(mobile) {
            pixi.Container.call(this);
            var texture = pixi.Texture.fromImage('assets/avatars/' + (mobile.avatar || 'devil.png')),
                sprite = new pixi.Sprite(texture);

            sprite.anchor.set(.5);
            this.setTransform(0, 0);

            this.addChild(sprite);
            this.name = mobile.name;
            this.location = new Location();
            this.gamePosition = position.factory(this);

            this.updateLocation = function (loc) {
                //self.location = loc;
            };

        }

        var o = Mobile.prototype = Object.create(pixi.Container.prototype);
        Mobile.prototype.constructor = Mobile;


        o.onMouseDown = o.onMouseUp = o.onMouseMove = o.frameTick = o.workerTick = function () {
        };

        return Mobile;

    });