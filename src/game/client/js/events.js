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


define(['eventFactory'], function (eventFactory) {

    var instance;

    function getInstance() {
        if (!instance) {
            instance = createInstance();
        }
        return instance;
    }

    return getInstance();

    function createInstance() {

        function e(callback) {
        }

        var events = {
            global: {
                windowResize: e
            },
            server: {
                send: e,
                connect: e,
                disconnect: e,
                login: e,
                logout: e,
                register: e,
                chatMessage: e,
                broadcastMessage: e,
                onUpdateFloor: e,
                onUpdateTile: e
            },
            game: {
                initialize: e,
                loginSuccess: e,
                // fps frame-tick (game-app.js)
                frameTick: e,
                // slowTick every .5 seconds
                // send mouse position to worker, calculate pathfinder...
                workerTick: e,
                mouseDown: e,
                mouseUp: e,
                mouseMove: e,
                mouseGridMove: e,
                screenGridMove: e,
                // contains player and mobile positions of current floor
                gameState: e,
                // contains name only
                playerLeftGame: e,
                // contains all data to create new player in game
                playerEnterGame: e
            },
            gameWorker: {
                ready: e
            },
            mainPlayer: {
                walk: e,
                showWalkPath: e,
                gridMoving: e,
                gridMoved: e
            },
            interface: {
                hideAll: e
            }
        };

        return eventFactory(events);

    }

});
