/*
 * Copyright (C) 28.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'pixi'],
    function (config, Logger, pixi) {

        var logger = Logger.getLogger('debugInfo');
        logger.setLevel(config.logger.debugInfo || 0);


        function DebugInfo(parent, x, y) {
            pixi.Text.call(this, '', {fontSize: '2em'});
            var self = this;
            this.x = x || 0;
            this.y = y || 0;

            this.debug = function(o){
                try{
                    self.text = JSON.stringify(o, null, 2);
                }catch(e){
                    logger.error('Debug error: ' + e, new Error().stack);
                }
            };
            parent && parent.addChild(this);
        }

        DebugInfo.prototype = Object.create(pixi.Text.prototype);
        DebugInfo.prototype.constructor = DebugInfo;


        return DebugInfo;

    });