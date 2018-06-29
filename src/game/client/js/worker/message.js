/*
 * Copyright (C) 27.01.17 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger'],
    function (config, Logger) {

        var logger = Logger.getLogger('message');
        logger.setLevel(config.logger.message || 0);

        return Message;

        function Message(connection) {
            var msg;

            this.parse = function (data) {
                var d = data.d, t = data.t;
                if (d && t) {
                    msg = {d: d, t: t};
                    return d;
                } else {
                    return false;
                }
            };

            this.create = function (data) {
                msg = {d: data, t: new Date().getTime()};
                return this;
            };

            this.emit = function (cmd) {
                connection.emit(cmd, msg);
            };

            this.emitTo = function (cmd, connection) {
                connection.emit(cmd, msg);
            }
        }


    });