/*
 * Copyright (C) 18.11.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'backbone', 'underscore', 'jquery', 'interfaceApp', 'gameEvents'], function (config, Logger, Backbone, _, $, App, events) {

    var instance, logger = Logger.getLogger('interfaceChat');
    logger.setLevel(config.logger.interfaceChat || 0);

    return getInstance();

    function getInstance() {
        if (!instance) {
            instance = createChat();
        }
        return instance;
    }

    function createChat() {

        return new (Backbone.View.extend(_.extend(new App(), {

            el: $('#window-chat'),
            el_msg: '#dsp-chat-messages',
            el_inp: '#inp-chat-message',
            el_body: '#window-chat-body',
            events: {
                'keypress #inp-chat-message ': 'onEnterMessage'
            },
            initialize: function () {
                // grap template
                var self = this;
                this.grabTemplate();

                this.viewData = this.translateKeys('chat', ['chat']);

                events.global.windowResize(this, this.pos);
                events.interface.hideAll(this, this.hide);
                events.game.loginSuccess(this, this.onShow);

                events.server.broadcastMessage(function(post){
                    self.addMessage(self.translate('chat.context_' + post.context, {user: post.name}));
                });

                events.server.chatMessage(function(post){
                    var name = post.name,
                        msg = post.msg;
                    self.addMessage(name + ': ' + msg);
                });

                events.game.playerEnterGame(function(player){
                    self.addMessage(self.translate('chat.playerEnterGame', {name: player.name}));
                });

                events.game.playerLeftGame(function(name){
                    self.addMessage(self.translate('chat.playerLeftGame', {name: name}));
                });

            },
            addMessage: function(msg){
                var node = this.$(this.el_msg);
                node.append('<tr><td>' + this.escapeHtml(msg) + '</td></tr>');
                this.$(this.el_body).scrollTop(node.height());
                this.pos();
            },
            onEnterMessage: function(e){
                var key = e.keyCode || e.charCode,
                    node = $(this.el_inp);
                if(key == 13){
                    var msg = (node.val() || '').trim();
                    if(msg != ''){
                        node.val('')
                        this.socket.send('server.chatMessage', msg);
                    }
                }
            },
            onShow: function () {
                this.render();
                this.$el.fadeIn();
            },
            pos: function(){
                this.bottomWindow(5);
                this.$el.css('left', 5);

            }
        })))();

    }
});