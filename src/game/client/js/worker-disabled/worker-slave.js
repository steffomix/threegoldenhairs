/*
 * Copyright (C) 14.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

self.importScripts('/js/lib/require.js');

var __slaveModuleID__ = Math.random().toString(36).substring(2) + new Date().getTime();

// create slave with unique module name
define(__slaveModuleID__,
    [],
    (function () {

        /**
         * Create Job from message event
         * @param e
         * @constructor
         */
        function Job(e) {
            this.cmd = e.data.cmd;
            this.data = e.data.data;
            // private id
            var id = e.data.id;
            this.getId = function () {
                return id;
            }
        }

        /**
         * response with other cmd
         * most likely for infinite Jobs
         * @param cmd {string} command
         * @param data {array} *should* be an array to be mapped as arguments
         */
        Job.prototype.send = function (cmd, data) {
            self.postMessage({
                id: this.getId(),
                cmd: cmd,
                data: data
            });
        };

        /**
         * Container to post-inject properties after creation of the socket Instance
         * @type {{socket: null, logger: null}}
         */
        var socketContainer = {
            socket: null,
            logger: null
        };

        var Socket = function(socketContainer){
            var self = this;
            /**
             * There sometimes is a timing problem on Google Chrome when the first job occurs
             * before the slave is fully loaded, initialized an onMessage finally overwritten.
             * To make the trouble perfect, this problem occurs mostly (if not only) when there is no Debugger running.
             *
             * In that case the Job must be resend as long as onMessage is not overwritten.
             * Through the overwriting of onMessage occurs another problem: The reference of
             * onMessage can not be used directly (self.onMessage) because its replaced with the new one.
             * It has to be called with an evaluated identifier (self['onMessage'])
             *
             *
             * @param job
             */
            // todo Google Chrome (only **without** debugger) seems to bounce initialization and call it twice :-S WTF?!?
            self.onMessage = function (job) {
                var self = this;
                console.warn('onMessage not replaced or Worker not ready. Resend Message in 10ms', {job: job});
                setTimeout(function ress(j){
                    if(!j){
                        console.warn('no Job set');
                    }
                    console.warn('Resend message: ' + j.cmd, {job: j});
                    self['onMessage'](j);
                }, 1000, job);
            };
            self.send = function (cmd, data) {
                socketContainer.logger.info('Socket-slave send ' + cmd, data)
                socketContainer.socket.send(cmd, data);
            };
        };

        var socket = new Socket(socketContainer),
            slaveId,
            slaveName,
            slaveConfig,
            slaveScript;


        /**
         * Create a socket Job ,
         * collect data from Event,
         * initialize requirejs with data from Event,
         * define config module
         * define socket module
         * import main script,
         * put socket Job into socketContainer, which is part of the initial worker socket
         * swich start message listener to runtime listener
         *
         * @param e
         */
        function onStart(e) {
            // will be the gameSocket in socket module
            var job = new Job(e);

            slaveId = job.data.id;
            slaveName = job.data.name;
            slaveScript = job.data.script;
            slaveConfig = job.data.config;

            // config requirejs with data from worker-master
            requirejs.config({paths: slaveConfig.paths, baseUrl: slaveConfig.baseUrl});
            define('config', [], function(){return slaveConfig});
            define('workerSlaveSocket', [], function(){return socket});

            // delete command
            job.cmd = '';

            // register infinite job as main socket
            socketContainer.socket = job;

            // remove starting listener
            self.removeEventListener('message', onStart);
            // add runtime listener
            self.addEventListener('message', onMessage);

            require(['logger', 'config'], function(Logger, config){
                var logger = Logger.getLogger('socketSlave');
                logger.setLevel(config.logger.workerSlave);
                socketContainer.logger = logger;

            });
            require([slaveScript], function(){});
            job.send('***worker started***');
        }

        /**
         * Handle incomming runtime messages
         * @param e
         */
        function onMessage(e) {
            var job = new Job(e);
            // console.log('Worker Slave onMessage: ', job);
            if (job.cmd == '***worker shutdown***') {
                console.log('Shutdown Worker' + slaveId + ' "' + slaveName + '" with Scripts: ', slaveScript);
                close();
            } else {
                // forward to main socket
                socket.onMessage(job);
            }
        }

        // add startup listener
        self.addEventListener('message', onStart);

        //console.log('Worker waking up, ready for setup.');
        self.postMessage({cmd: '***worker ready***'});

        return socket;

    })());
