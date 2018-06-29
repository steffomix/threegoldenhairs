/* 
 * Copyright (C) 20.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


define('util', ['config', 'logger', 'underscore'], function (config, Logger, _) {

    var instance,
        logger = Logger.getLogger('gameUtil');
    logger.setLevel(config.logger.gameUtil || 0);

    return getInstance();

    function getInstance () {
        if ( !instance ) {
            instance = new Util();
        }
        return instance;
    }

    function Util () {

        /**
         * center window in frame sync.
         * @param frame
         * @param win
         * @returns {{left: number, top: number}}
         */
        this.centerWindow = function (frame, win) {
            var bx = parseInt(frame.css('width')),
                by = parseInt(frame.css('height')),
                wx = parseInt(win.css('width')),
                wy = parseInt(win.css('height')),
                wTop = by / 2 - wy / 2,
                wLeft = bx / 2 - wx / 2;
            return {left: wLeft, top: wTop}
        };

        /**
         *
         * @param frame
         * @param win
         * @param distance
         * @returns {{top: number}}
         */
        this.bottomWindow = function(frame, win, distance){
            var fh = parseInt(frame.css('height')),
                wh = parseInt(win.css('height')),
                top = fh - wh - distance;

            return {top: top};
        };

        /**
         *
         * @param frame
         * @param win
         * @param distance
         * @returns {{right: number}}
         */
        this.rightWindow = function(frame, win, distance){
            var fw = parseInt(frame.css('width')),
                ww = parseInt(win.css('width')),
                right = fw - ww - distance;

            return {right: right};
        };


        /**
         * "Select" Components on given conditions
         * @param conditions {array} [[key, compare, value,], ...]
         */
        this.findByConditions = function (targets, conditions) {
            var selected = [];
            _.each(targets, function (item) {
                var hits = 0;
                try {
                    for (var i = 0; i < conditions.length; i++) {
                        var k = conditions[i][0],
                            c = conditions[i][1],
                            v = conditions[i][2];
                        switch (c) {
                            case '=':
                                item[k] === v && hits++;
                                break;
                            case '>':
                                item[k] > v && hits++;
                                break;
                            case '>=':
                                item[k] >= v && hits++;
                                break;
                            case '<':
                                item[k] < v && hits++;
                                break;
                            case '<=':
                                item[k] <= v && hits++;
                                break;
                            case '!=':
                                item[k] != v && hits++;
                                break;
                            case 'in':
                                _.find(v, function (v) {
                                    return item[k] === v;
                                }) && hits++;
                                break;

                            default:
                                logger.error('FindByConditions: Unsupported condition "' + c + '" ');
                        }
                        hits == conditions.length && selected.push(item);
                    }
                } catch (e) {
                    logger.error('findByConditions: throw Error: ' + e, targets, conditions);
                }
            });
            return selected;
        }
    }
});
