/* 
 * Copyright (C) 24.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

define('commandRouter', ['config', 'logger', 'underscore'],
    function (config, Logger, _) {

        var router = {},
            logger = Logger.getLogger('commandRouter');
        logger.setLevel(config.logger.commandRouter || 0);

        return {
            getRouter: _getRouter
        };


        function _getRouter (name) {
            if ( router[name] ) {
                return router[name];
            } else {
                var newRouter = new CommandRouter(name);
                name = '' + name;
                logger.info('Create CommandRouter ' + name);
                router[name] = newRouter;
                return newRouter;
            }
        }

        function Listener () {
            var listener = {};

            this.getListener = function (id) {
                return listener[id];
            };

            this.listenTo = function (id, fn) {
                listener[id] = fn;
            };

            this.list = function(){
                return Object.keys(listener);
            }
        }

        /**
         * Creates a command router instance
         * @param name {string} Only used as logging prefix
         * @constructor
         */
        function CommandRouter (name) {

            var modules = {},
                listener = new Listener();


            /**
             * Add module to command receivers list and
             * combines name and command to command 'name.command'.
             * E.g. router.route('moduleName.command', []);
             * @param name {string} command prefix and module name
             * @param module {object}
             * @param commands {object} key<command>:value<boolean enabled> pairs
             */
            this.addModule = function (name, module, commands) {
                if ( modules[name] ) {
                    return logger.error('CommandRouter: Module "' + name + '" already set');
                } else {
                    this.replaceModule(name, module, commands);
                }
            };
            /**
             * Overwrites receivers list and
             * combines name and command to command 'name.command'.
             * E.g. router.route('moduleName.command', []);
             * @param name {string} command prefix and module name
             * @param module {object}
             * @param commands {object} key<command>:value<boolean enabled> pairs
             */
            this.replaceModule = function(name, module, commands){
                modules[name] = module;
                _.each(commands, function (fn, key) {
                    listener.listenTo(name + '.' + key, fn);
                });
            };

            /**
             * Map Arguments to Job-like Object and forward command to route.
             * The Job-like Object has no Worker Message Id or any alike functionality 
             * and can *NOT* be used to send through Worker Socket.
             * @param cmd {string} <module>.<command>
             * @param data {any} 
             */
            this.command = function (cmd, data) {
                logger.info(name + ' forward command: ' + cmd, data);
                this.route({
                    cmd: cmd,
                    data: data
                });
            };

            /**
             * 
             * @param job {object} {cmd: string, data: any}
             */
            this.route = function (job) {
                var cmd = job.cmd;
                logger.info(name, job);
                var mod = cmd.split('.')[0];
                try {
                    if ( modules[mod] ) {
                        var obj = modules[mod],
                            fn = listener.getListener(cmd);
                        if ( _.isFunction(fn) ) {
                            fn.apply(obj, [job]);
                        } else {
                            logger.error('Router ' + name + ': target "' + cmd + '" is not a function.', job, listener.list());
                        }
                    } else {
                        logger.error('Router ' + name + ': target "' + cmd + '" not found.', job, listener.list());
                    }
                } catch (e) {
                    logger.error('Route ' + name + ': "' + cmd + '" throw error:' + e, job, listener.list());
                }
            };

        }


    });
