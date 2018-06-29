/*
 * Copyright (C) 07.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'gameEvents', 'pixi', 'gameMainPlayer'],
    function (config, Logger, events, pixi, MainPlayer) {

        var logger = Logger.getLogger('pixiMainPlayer');
        logger.setLevel(config.logger.pixiMainPlayer || 0);


        function PixiMainPlayer() {
            pixi.Container.call(this);

            var self = this;

            events.game.loginSuccess(function (user) {
                self.removeChildren().forEach(function(child){
                    child.destroy();
                });
                self.addChild(new MainPlayer(user));
            });
        }

        PixiMainPlayer.prototype = Object.create(pixi.Container.prototype);
        PixiMainPlayer.prototype.constructor = PixiMainPlayer;


        return PixiMainPlayer;

    });