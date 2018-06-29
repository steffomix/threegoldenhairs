/*
 * Copyright (C) 25.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'gameEvents', 'pixi', 'gameApp', 'pixiMainPlayer'],
    function (config, Logger, events, pixi, gameApp, PixiMainPlayer) {

        var instance,
            logger = Logger.getLogger('pixiPlayers');
        logger.setLevel(config.logger.pixiPlayers || 0);

        function getInstance() {
            if (!instance) {
                instance = new PixiPlayerLayer();
            }
            return instance;
        }

        function PixiPlayerLayer() {
            pixi.Container.call(this);
            var players = new pixi.Container(),
                mainPlayer = new PixiMainPlayer();

            this.addChild(players);
            this.addChild(mainPlayer);

            this.addPlayer = function(player){
                players.addChild(player);
            };

            this.removePlayer = function(player){
                var childs = players.children;
                for(var i = 0; i < childs.length; i++){
                    if(childs[i].name == player.name){
                        players.removeChild(childs[i]).destroy();
                        break;
                    }
                }
            }
        }

        PixiPlayerLayer.prototype = Object.create(pixi.Container.prototype);
        PixiPlayerLayer.prototype.constructor = PixiPlayerLayer;

        return getInstance();
    });