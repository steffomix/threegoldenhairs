/* 
 * Copyright (C) 16.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


/**
 * workerSocket
 * Web Worker entry point
 */
define('workerSocket', ['config', 'logger', 'workerSlaveSocket', 'workerRouter'],
    function (config, Logger, socket, router) {

        var instance,
            logger = Logger.getLogger('workerSocket');
        logger.setLevel(config.logger.workerSocket || 0);

        return getInstance();

        function getInstance() {
            if (instance === undefined) {
                instance = new WorkerSocket();
            }
            return instance;
        }

        /**
         *
         * @constructor
         */
        function WorkerSocket() {

            router.addModule('workerSocket', this, {
                send: socket.send
            });
            socket.onMessage = router.route;
            this.send = socket.send;
        }
    });


