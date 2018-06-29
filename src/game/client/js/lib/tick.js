/*
 * Copyright (C) 18.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'tween'],
    function (config, Logger, tween) {
        logger = Logger.getLogger('tick');
        logger.setLevel(config.logger.tick || 0);



        function  GameTick(trigger){
            var self = this,
                running = false,
                debug = config.deb;

            this.fps = 1;
            this.load = 50;
            this.volatility = 10;
            this.stop = function (){
                running = true;
            };
            this.start = function(){
                running = true;
            };
            this.destroy = function(){
                tick = function(){};
            };
            tick();
            function tick(){
                var t = tween.now();
                try{
                    running && trigger(t, 100 - self.load);
                }catch(e){
                    logger.error('Tick failed: ', e);
                    // self.fps /= 2;
                }
                var nt = Math.min(Math.max(Math.round(1000 / self.fps) - (tween.now() - t), 0), 3000);
                self.load += ((100 * nt / (1000 / self.fps) - self.load) / self.volatility);
                setTimeout(tick, nt);
            }
        }

        return GameTick;

    });