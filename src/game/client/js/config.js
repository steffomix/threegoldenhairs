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


(function () {
    var conf = {
        debug: true, // show debug info on screen
        requirejs: {
            baseUrl: '/js/',
            urlArgs: "c=" + (new Date().getTime()),
            paths: {
                // third party libs
                logger: 'bower/loglevel/dist/loglevel.min',
                seedrandom: 'bower/seedrandom/seedrandom',
                underscore: 'bower/underscore/underscore-min', // mapped (defined) as lodash
                lodash: 'bower/lodash/dist/lodash.min',
                backbone: 'bower/backbone/backbone-min',
                jquery: 'bower/jquery/dist/jquery.min',
                io: 'bower/socket.io-client/dist/socket.io',
                machina: 'bower/machina/lib/machina.min',
                tween: 'bower/tween.js/src/Tween',
                pixi: 'bower/pixi.js/dist/pixi',
                pathfinding: 'lib/pathfinding',

                // own or modified libs
                noise: 'lib/noise',
                backboneEvents: 'lib/backbone-events',
                eventFactory: 'lib/event-factory',
                tick: 'lib/tick',
                i18n: 'lib/i18n',
                easystar: 'lib/easystar-dynmaps-0.3.1',
                pathfinder: 'lib/pathfinder'
            }
        },
        game: {
            frameTick: 35, // ticks per second. Game calculations and pixi render per second...
            workerTick: 2, // ticks per second. Send mouse position to worker...
            tiles: {
                size: 120, // tile size in px
                scale: .5, // scale tiles
                speedAcc: .2 // move speed
            },
            chunks: {
                size: 8 // chunks are not used in this game but needed in GamePosition
            }
        },
        worker: {
            gameWorker: 'js/worker/worker.js' // started in game/game-app.js
        }
    };


    // format:
    // module name, path, loglevel
    // 1: trace
    // 2: info
    // 3: warn
    // 4: error
    // 5: off
    var modules = [

        // game/shared
        ['util', 'util', 3],
        ['translation', 'translation', 3],
        ['gameEvents', 'events', 3],
        ['debugInfo', 'debug-info', 0],
        ['workerMaster', 'worker-master', 3],
        ['commandRouter', 'command-router', 3],
        ['worldGenerator', 'world-generator', 0],
        ['tileDefinitions', 'tile-definitions', 0],

        // interface
        // ['interface', 'interface/interface', 0],
        ['interfaceApp', 'interface/interface-app', 0],
        ['interfaceConnect', 'interface/interface-connect', 0],
        ['interfaceLogin', 'interface/interface-login', 0],
        ['interfaceTopnav', 'interface/interface-topnav', 0],
        ['interfaceChat', 'interface/interface-chat', 0],
        ['interfaceGame', 'interface/interface-game', 0],

        // worker:
        ['server', 'worker/server', 0],
        ['message', 'worker/message', 0],
        ['workerMainPlayer', 'worker/worker-main-player', 0],

        // game
        ['gameApp', 'game/game-app', 0],
        ['gameLocation', 'game/game-location', 0],
        ['gamePosition', 'game/game-position', 0],
        //['gameFloorManager', 'game/game-floor-manager', 0],
        ['gameFloor', 'game/game-floor', 0],
        ['gameTile', 'game/game-tile', 0],
        ['gameMainPlayer', 'game/game-main-player', 0], // extends gamePlayer
        ['gamePlayer', 'game/game-player', 0], // extends gameMobile
        ['gameMobile', 'game/game-mobile', 0], // extends pixi.Container
        ['gamePlayerManager', 'game/game-player-manager', 0],

        // pixi
        ['pixiRoot', 'pixilayer/pixilayer-root', 0],
        ['pixiTiles', 'pixilayer/pixilayer-tiles', 0],
        ['pixiPlayers', 'pixilayer/pixilayer-players', 0],
        ['pixiMainPlayer', 'pixilayer/pixilayer-mainplayer', 0]

    ];

    // setup config for paths and logger
    // The logger is modified to prefix module name on loglevel trace
    conf.logger = {};
    modules.forEach(function (item) {
        var module = item[0],
            path = item[1],
            logLevel = item[2];

        conf.requirejs.paths[module] = path;
        conf.logger[module] = logLevel;


        // conf.requirejs.logger[module] = 1; // all trace
        // conf.requirejs.logger[module] = 2; // all info
        // conf.requirejs.logger[module] = 3; // all warn
        // conf.requirejs.logger[module] = 4; // all error
        // conf.requirejs.logger[module] = 5; // all off

    });

    // setup requirejs
    requirejs.config({
        paths: conf.requirejs.paths,
        baseUrl: conf.requirejs.baseUrl
    });

    define('underscore', ['lodash'], function(_){
        return _;
    });

    // create config module to be loadable
    define('config', [], function () {

        return conf;
    });

})();



















