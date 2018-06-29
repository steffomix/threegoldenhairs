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


define(['config', 'logger', 'backbone', 'underscore', 'jquery', 'interfaceApp', 'gameApp', 'gameEvents'],
    function (config, Logger, Backbone, _, $, App, gameApp, events) {

        var instance,
            logger = Logger.getLogger('interfaceConnect');
        logger.setLevel(config.logger.interfaceConnect || 0);

        return getInstance();

        function getInstance () {
            if ( !instance ) {
                instance = createConnect();
            }
            return instance;
        }

        function createConnect () {

            return new (Backbone.View.extend(_.extend(new App(), {

                el: $('#window-game-connect'),
                el_msg: '#game-connect-message',
                el_btn: '#button-game-connect',
                events: {
                    'click #button-game-connect': 'connect'
                },
                initialize: function () {
                    // grap template
                    this.grabTemplate();
                    this.viewData = this.translateKeys('connect', [
                        'connect', 'connectToGame'
                    ]);

                    events.global.windowResize(this, this.centerWindow);
                    events.interface.hideAll(this, this.hide);

                    events.server.disconnect(this, function(){
                        events.interface.hideAll.trigger();
                        this.onShow();
                    });
                    events.server.connect(this, this.hide);

                    this.onShow();
                },
                connect: function () {
                    gameApp.work(events.server.connect);
                    this.hideButton();
                },
                onShow: function () {
                    this.render();
                    this.hideButton();
                    this.centerWindow();
                    this.$el.fadeIn();
                },
                hideButton: function(){
                    var btn = $(this.el_btn);
                    btn.hide();
                    setTimeout(function(){
                        btn.show();
                    }, 3000);
                }
            })))();

        }
    });
