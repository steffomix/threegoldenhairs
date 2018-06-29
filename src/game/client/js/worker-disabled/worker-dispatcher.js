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


    define(['config', 'logger', 'workerEvents', 'underscore'], function (config, Logger, Events, _) {

        var instance;
                logger = Logger.getLogger('workerDispatcher');
            logger.setLevel(config.logger.workerDispatcher || 0);

        function getInstance () {
            if ( !instance ) {
                instance = createInstance();
            }
            return instance;
        }

        return getInstance();

        function createInstance () {
            /**
             * dummy for IDE (will be overwritten while creation)
             * orig: this.listenTo(this.eventHandler, 'event', this.callback);
             * wrap: <event>.listenTo(<eventContext>, <callback> [, <callbackContext (defaults to eventContext)>]);
             *
             * result in usage register: events.global.myEvent(this, callback);
             * result in usage trigger: events.global.myEvent.trigger();
             *
             * @param callback {object} orig this
             *
             */
            function e (callback) {}
            var eventHandler = {},
                template = {
                    mainPlayer: {
                        mouseDown: e,
                        mouseUp: e,
                        mouseGridMove: e
                    }
                };

            _.each(template, function (events, category) {
                var handler = eventHandler[category] = _.extend({}, Events);
                handler.name = category;
                var categoryEvents = {
                    // turn off listener from <category>.<**all events**> with given _this or callback or both:
                    // off() complete purge of category and all its events.
                    // off(callback) turn off all with given callback, no matter what this is
                    // off(null, this) turn off all with given this, no matter what callback is
                    // off(callback, this) turn off all with given callback and this
                    off: function (callback, _this) {
                        if(!callback && _this){
                            handler.off();
                        }else{
                            _.each(template[category], function(v, k){
                                k != 'off' && template[category][k].off(callback, _this);
                            });
                        }
                    }
                };
                events.all = e;
                _.each(events, function (value, event) {
                    // create new Listener <event> in <category>
                    // e.g.: template.global.onSomething(this, fn);
                    categoryEvents[event] = function (callback) {
                        handler.listenTo(handler, event, callback);
                    };
                    // create new Listener <event> in <category> for only one trigger
                    // e.g.: template.global.onSomething(this, fn);
                    categoryEvents[event].once = function (_this, callback) {
                        callback ? _this.listenToOnce(handler, event, callback) : handler.listenToOnce(handler, event, _this);
                    };
                    // trigger listener
                    // e.g.: template.global.onSomething.trigger();
                    categoryEvents[event].trigger = function () {
                        var args = Array.prototype.slice.call(arguments);
                        //logger.info('**Event** ' + category + '.' + event, args);
                        handler.trigger.apply(handler, [event].concat(args));
                    };
                    // returns trigger and destroy orig Trigger to prevent abuse
                    categoryEvents[event].claimTrigger = function(claimer){
                        var fn = categoryEvents[event].trigger;
                        delete categoryEvents[event].trigger; // cut reference to fn
                        categoryEvents[event].trigger = function(){
                            logger.error('Trigger ' + category + '.' + event + ' is claimed by :', claimer);
                        };
                        return fn;
                    };
                    // turn off listener from <category>.<event> with given _this or callback or both:
                    // off() complete purge of category.event
                    // off(callback) turn off all with given callback, no matter what this is
                    // off(null, this) turn off all with given this, no matter what callback is
                    // off(callback, this) turn off all with given callback and this
                    // e.g.: template.global.onSomething.off(fn, this);
                    categoryEvents[event].off = function (callback, _this) {
                        handler.off(event, callback, _this);
                    };

                });
                template[category] = categoryEvents;
            });

            return template;
        }

    });
