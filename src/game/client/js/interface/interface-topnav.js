/* 
 * Copyright (C) 11.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define([
    'config', 'logger', 'backbone', 'underscore', 'jquery', 'interfaceApp', 'gameEvents'
], function (config, Logger, Backbone, _, $, App, events) {

    var instance, logger = Logger.getLogger('interfaceTopnav');
    logger.setLevel(config.logger.interfaceTopnav || 0);

    return getInstance();

    function getInstance() {
        if (!instance) {
            instance = createTopnav();
        }
        return instance;
    }

    // http://www.w3schools.com/howto/howto_js_topnav.asp
    function createTopnav() {

        return new (Backbone.View.extend(_.extend(new App(), {

            el: $('#window-topnav'),
            el_nav: '#topnav',
            el_resp: '#onClickResponsive',
            events: {
                'click #topnav-icon-responsive': 'onClickResponsive',
                'click #topnav-logout': 'onLogout'
            },
            initialize: function () {
                // grap template
                this.grabTemplate();

                this.viewData = this.translateKeys('topnav', [
                    'logout'
                ]);

                events.global.windowResize(this, this.pos);
                events.interface.hideAll(this, this.hide);
                events.game.loginSuccess(this, this.onShow);

            },
            onLogout: function(){
                this.socket.send('server.logout');
            },
            onClickResponsive: function () {
                $(this.el_nav).toggleClass('responsive');
            },
            onShow: function () {
                this.render();
                this.$el.show();
                this.pos();
            },
            pos: function () {
                this.$el.css('width', this.$body.css('width'));
            }
        })))();

    }
});