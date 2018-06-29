/*
 * Copyright (C) 17.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


define('server', ['config', 'logger', 'message', 'workerApp', 'io', 'gameEvents'],
    function (config, Logger, Message, gameApp, io, events) {

        var connection,
            message,
            instance,
            logger = Logger.getLogger('server');
        logger.setLevel(config.logger.server || 0);

        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new ServerSocket();
            }
            return instance;
        }


        function ServerSocket() {

            events.server.send(send);
            events.server.connect(connect);
            events.server.disconnect(disconnect);

            events.server.login(function (data) {
                console.log('login', data);
                send('login', data);
            });

            events.server.logout(function () {
                send('logout');
            });

            events.server.register(function (data) {
                send('register', data);
            });

            events.server.chatMessage(function (data) {
                send('chatMessage', data);
            });

            setTimeout(connect, 100);
        }

        function connect() {
            disconnect();
            connection = io();
            message = new Message(connection);
            setupListener();
        }

        function disconnect() {
            try {
                connection.disconnect();
                connection = null;
                message = null;
            } catch (e) {
                //logger.warn('Server disconnected by client.', e);
            }
        }

        function send(cmd, data) {
            if (connection && connection.connected) {
                message.create(data).emit(cmd);
            }
        }

        /**
         * setup handler for incoming messages
         */
        function setupListener() {

            connection.on('connect', function () {
                logger.info('Server: onConnect');
                gameApp.send(events.server.connect);
                //socket.send('interfaceConnect.connect');
            });
            connection.on('disconnect', function () {
                logger.info('Server: onDisconnect');
                gameApp.send(events.server.disconnect);
                //socket.send('interfaceConnect.disconnect');
            });

            connection.on('register', function (msg) {
                var data = message.parse(msg);
                if(data){
                    logger.info('Server: onRegister', data);
                    gameApp.send(events.server.register, data);
                }else{
                    logger.warn('receives malfactured data')
                }
            });

            connection.on('login', function (msg) {
                var data = message.parse(msg);
                logger.info('Server: onLogin', data);
                gameApp.send(events.server.login, data);
            });

            connection.on('logout', function (msg) {
                var data = message.parse(msg);
                logger.info('Server: Logout by Server', data);
                gameApp.send(events.server.logout);
            });

            connection.on('gameState', function(msg){
                var data = message.parse(msg);
                //logger.info('gameState', data);
            });

            connection.on('playerLeftGame', function(msg){
                var name = message.parse(msg);
                gameApp.send(events.game.playerLeftGame, name);
            });

            connection.on('playerEnterGame', function(msg){
                var player = message.parse(msg);
                gameApp.send(events.game.playerEnterGame, player);
            });

            connection.on('broadcastMessage', function (msg) {
                var data = message.parse(msg);
                var cmd = data.cmd;
                logger.info('Server: broadcastMessage', data);

                gameApp.send(events.server.broadcastMessage, data);
                /*
                 socket.send('interfaceChat.broadcastMessage', {
                 context: cmd,
                 name: data.name,
                 msg: data.msg || ''
                 });
                 */
            });

            connection.on('chatMessage', function (msg) {
                var data = message.parse(msg);
                logger.info('Server: chatMessage', data);
                gameApp(events.server.chatMessage, data);
            });

            connection.on('mainPlayerMove', function(msg){
                var data = message.parse(msg);
                gameApp.send(events.mainPlayer.walk, data);
                logger.info('server mainPlayerMove', msg);

            });


        }
    });
