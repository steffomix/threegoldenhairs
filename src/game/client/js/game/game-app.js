/*
 * Copyright (C) 17.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'backbone', 'underscore', 'pixi', 'jquery', 'gamePosition', 'gameEvents', 'tick'],
    function (config, Logger, Backbone, _, pixi, $, gamePosition, events, Tick) {

        var gameApp,
            logger = Logger.getLogger('gameApp');
        logger.setLevel(config.logger.gameApp || 0);

        var gameWorker = new Worker(config.worker.gameWorker),
            modules = {},
            frameTick = new Tick(events.game.frameTick.claimTrigger(this)),
            workerTick = new Tick(events.game.workerTick.claimTrigger(this));

        frameTick.fps = config.game.frameTick;
        workerTick.fps = config.game.workerTick;

        events.game.initialize(function () {
            // start ticker after initialize is finished
            setTimeout(function () {
                frameTick.start();
                workerTick.start();
            }, 100);

        });

        // wrap worker messages to game events
        gameWorker.addEventListener('message', function (e) {
            try {
                if (e.data.event) {
                    if (events[e.data.event[0]] && events[e.data.event[0]][e.data.event[1]]) {
                        events[e.data.event[0]][e.data.event[1]].trigger(e.data.data);
                    } else {
                        console.error('Dispatch Message form Worker not found: ', e.data.event, e.data);
                    }
                } else {
                    console.error('dispatch Message from Worker has no event', e.data);
                }
            } catch (ex) {
                console.error('Dispatch message from Worker: ', ex, e.data);
            }
        });

        events.gameWorker.ready(function(){
            logger.info('Gameworker started, initialize game...', performance.now())
            events.game.initialize.claimTrigger('main.js')();
        });

        events.server.connect(function(){
            logger.info('game-app fake login user on connect');
            setTimeout(function(){
                gameApp.work(events.server.login, {user: 'user', pwd: 'user'});
                //events.game.loginSuccess.trigger({user: "user"});
            }, 200);
        });


        function GameApp() {

            // wrapper to events....worker
            this.work = function(event, data){
                event.worker(gameWorker, data);
            };

            this.set = function (id, module) {
                modules[id] = module;
            };

            this.get = function (id) {
                return modules[id];
            };

        }

        function getInstance() {
            if (!gameApp) {
                gameApp = new GameApp();
            }
            return gameApp;
        }

        return getInstance();

    });