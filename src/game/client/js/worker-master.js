/*
 * Copyright (C) 10.11.16 Stefan Brinkmann <steffomix@gmail.com>
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
 *
 *  ### find
 *  jobId = worker.create(
 *      'find',
 *      {
 *          startX,
 *          startY,
 *          endX,
 *          endY,
 *          matrix
 *      },
 *      function (job) {
 *      },
 *      scope optional
 *  );
 *
 *
 */




define('workerMaster', ['config', 'logger'], function (config, Logger) {


    var allWorkerId = 0;


    /**
     *
     * @param script {Array} List of scripts to load into the Worker.
     *          Full paths are required (like HTML head script paths).
     * @param name {string} optional Human readable Name
     * @param socketManagerReady {function}(socket) Callback for initial infinite Job
     * @param onSocketMessage {function} Callback
     * @param createWorkerScope {object} optional apply object for callback
     * @returns {object}
     */
    function WorkMaster (script, name, socketManagerReady, onSocketMessage, createWorkerScope) {

        var workerId = allWorkerId++;
        var logger = Logger.getLogger('workerMaster');
        logger.setLevel(config.logger.workerMaster || 0);
        var jobId = 0;
        var worker = new Worker(config.paths.workerSlave);


        logger.info('Create Worker-master #' + workerId);
        /**
         * Container for running jobs
         * The contents will look like that:
         * worker.jobs {
             *      0: {
             *          id: jobId,
             *          job: Job {
             *              id: jobId,
             *              cmd: cmd,
             *              data: data
             *          },
             *          callback: function,
             *          scope: object
             *          },
             *       1: ...
             *  }
         *
         *
         * @type {{}}
         */
        worker.jobs = {};

        function getId () {

            return (jobId++) + '_' + Math.random().toString(36).substring(2);
        }

        /**
         * Private wrapper from methods request and socket
         * @param sock {boolean} the job can response multiple times
         * @param cmd {string} Command for the Worker
         * @param data {any}
         * @param cb {function} callback
         * @param scope {object} optional scope
         * @returns Job {Job}
         */
        function _run (sock, cmd, data, cb, scope) {

            var id = getId(),
                job = new Job(sock, id, cmd, data);
            worker.jobs[id] = {
                job: job,
                sock: sock,
                cb: cb,
                scope: scope
            };
            worker.postMessage({
                id: id,
                cmd: cmd,
                data: data,
                callStack: new Error('Start Worker ' + (name || '')).stack.split('\n')
            });
            return job;
        }

        /**
         * Send a fire-and-forget message
         * @param cmd {string} command
         * @param data {array} *should* be an array to be mapped as arguments
         */
        function send (cmd, data) {
            try {
                logger.info('WorkerMaster: Send cmd: ' + cmd, data);
                worker.postMessage({
                    id: null,
                    cmd: cmd,
                    data: data
                });
            } catch (e) {
                logger.error('WorkerMaster: Send message failed: ' + e);
            }
        }

        /**
         * Wrapper to _run().
         * Start a job that can response only one times
         * afterwards its deleted from workers joblist
         * and makes no further callbacks (response) possible.
         * @param cmd {string} command
         * @param data {array} *should* be an array to be mapped as arguments
         * @param cb {callback} function optional, if not set callback will be skipped quietly
         * @param scope {object} optional, applied to callback
         * @returns Job {Job} worker-master.js->Job
         */
        function request (cmd, data, cb, scope) {
            logger.info('WorkerMaster: Request cmd: ' + cmd, data);
            return _run(false, cmd, data, cb, scope);
        }

        /**
         * Wrapper to _run().
         * Same as run, but the job will *NOT* (never) be deleted
         * and make endless, most likely setInterval-callbacks (responses) possible
         * to provide continously updates to the caller of the job.
         *
         * @param cmd {string} command
         * @param data {array} *should* be an array to be mapped as arguments
         * @param cb callback function
         * @param scope object optional, applied to callback
         * @returns Job {Job}
         */
        function socket (cmd, data, cb, scope) {
            logger.info('WorkerMaster: socket cmd: ' + cmd, data);
            return _run(true, cmd, data, cb, scope);
        }

        /**
         *
         */
        function shutdown () {
            setupLogger.trace('WorkerMaster: Shutdown worker "' + name + '"')
            send('***worker shutdown***');
            send = socket = request = function () {
                console.error('Worker "' + name + '" with script ' + script + ' is down.', new Error().stack);
            }
        }

        /**
         * Job will be the argument of the callback function
         *
         *
         * @param sock {bool} true turns the job into a socket
         * @param id {int}
         * @param cmd {string}
         * @param data {array}
         * @constructor
         */
        function Job (sock, id, cmd, data) {
            var self = this;
            self.getId = function () {
                return id;
            };
            self.isSocket = function () {
                return sock;
            };
            self.cmd = cmd;
            self.data = data;
            if ( sock ) {
                self.send = send;
                self.request = request;
            }
        }

        /**
         *
         * @param e {Event}
         */
        function onMessage (e) {
            var id = e.data.id;
            if ( !id ) {
                logger.error('WorkerMaster: Receives Message without Id. Reject Message', e);
                return;
            }
            var item = this.jobs[id],
                job, cb, scope;
            if ( item ) {
                job = item.job;
                cb = item.cb;
                scope = item.scope;

                logger.info('WorkerMaster: Receive ' + (item.sock ? 'socket' : 'response' ) + ' message with cmd "' + job.cmd + '"', e.data.data);

                if ( !item.sock ) {
                    delete this.jobs[id];
                } else {
                    job.cmd = e.data.cmd;
                }
                job.data = e.data.data;
                if ( cb ) {
                    try {
                        if ( scope ) {
                            cb.apply(scope, job);
                        } else {
                            cb(job);
                        }
                    } catch (e) {
                        logger.error('WorkerMaster: Invoke callback onMessage raised error: ', e);
                    }
                }
            } else {
                console.log('WorkerMaster: Response from deleted or never existed Job. Reject Message', e);
            }
        }

        /**
         * Handle Worker startup sequence
         * @param e {Event}
         */
        function onWorkerSetup (e) {
            if ( e.data.cmd == '***worker ready***' ) {
                logger.info('WorkerMaster: Setup slave with: ' + config.baseUrl + config.paths[script] + '.js');
                socket(
                    '***worker start***',
                    {
                        id: workerId,
                        name: name || '',
                        script: script,
                        config: config
                    },
                    onSocketMessage,
                    createWorkerScope);
            } else if ( e.data.cmd == '***worker started***' ) {
                logger.info('WorkerMaster: Slave "' + name + '" ready to go. Perform callback...');
                worker.removeEventListener('message', onWorkerSetup);
                this.addEventListener('message', onMessage);
                try {
                    var job = worker.jobs[e.data.id].job;
                    job.cmd = '';
                    createWorkerScope ? socketManagerReady.apply(createWorkerScope, [job]) : socketManagerReady(job);
                } catch (e) {

                }
            } else {

            }
        }

        /**
         *  setup worker
         */
        worker.addEventListener('message', onWorkerSetup);


        this.send = send;
        this.request = request;
        this.socket = socket;
    }


    return WorkMaster;

});

