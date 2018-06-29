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

define(['config', 'logger', 'gameApp', 'i18n', 'backbone', 'underscore', 'jquery', 'util', 'gameEvents'],
    function (config, Logger, gameApp, i18n, Backbone, _, $, util, events) {

        var user = {},
            interfaces = {},
            templates = {},
            $body = $('body'),
            logger = Logger.getLogger('interfaceApp');
        logger.setLevel(config.logger.interfaceApp || 0);


        (function(){
            _.each(config.paths, function (v, k) {
                if ( v.indexOf('interface/') != -1 ) {
                    interfaces[k] = require([k], function () {
                    });
                }
            });

            _.templateSettings = {
                evaluate: /\{\{([\s\S]+?)\}\}/g,
                interpolate: /\{\{=([\s\S]+?)\}\}/g,
                escape: /\{\{-([\s\S]+?)\}\}/g
            };

            window.addEventListener('resize', function (e) {
                var w = $body.width(),
                    h = $body.height();
                events.global.windowResize.trigger();
                // elements may need a second resize after rearranging all interface elements
                setTimeout(function(){
                    var w2 = $body.width(),
                        h2 = $body.height();
                    if(w != w2 || h != h2){
                        logger.warn('window postresized: ', w - w2, h - h2);
                        events.global.windowResize.trigger();
                    }
                }, 10);
            });

            events.server.disconnect.trigger();
            $('#game-container').show();

        })();

        function escapeHtml(text){
            return $('<div/>').text(text).html();
        }

        function getInterface(name){
            if(!interfaces[name]){
                logger.error('InterfaceApp::getInterface "'+name+'" not found');
            }else{
                return interfaces[name];
            }
        }

        function render (data, templ) {
            data = data || this.viewData || {};
            templ = templ || this.template || '<div>No Template found</div>';

            try {
                this.$el.html(_.template(templ)(data));
            } catch (e) {
                this.$el.html('Render error: ' + e);
                logger.error('Render Error: ', e, data, templ);
            }
        }

        /**
         * Grab Template from Html Body
         * and store a copy, named by its html-id in templates
         */
        function grabTemplate(){
            var id = this.$el.attr('id'),
                html = this.$el.html();
            if(!id){
                logger.error('Template has no id: ', html);
            }
            this.template = templates[id] = html;
            this.$el.html('').fadeOut();
        }

        /**
         * Get a previous grabbed Template by its html id
         * @param id
         * @returns {*}
         */
        function getTemplate(id){
            if(templates[id]){
                return templates[id];
            }else{
                var msg = 'Template ' + id + ' not found.';
                logger.error(msg);
                return '<div>' + msg + '</div>';
            }
        }


        function hide(){
            this.$el.fadeOut();
        }

        function centerWindow(){
            // resizeWindow();
            this.$el.css(this.util.centerWindow(this.$body, this.$el));
        }

        function bottomWindow(distance){
            // resizeWindow();
            this.$el.css(this.util.bottomWindow(this.$body, this.$el, distance));
        }

        function rightWindow(distance){
            // resizeWindow();
            this.$el.css(this.util.rightWindow(this.$body, this.$el, distance));
        }

        function resizeWindow(){
            // resizeWindow();
            window.dispatchEvent(new Event('resize'));
        }


        function InterfaceApp () {
            this.$body = $body;
            this.getInterface = getInterface;
            this.getTemplate = getTemplate;
            this.centerWindow = centerWindow;
            this.bottomWindow = bottomWindow;
            this.rightWindow = rightWindow;
            this.resizeWindow = resizeWindow;
            this.hide = hide;
            this.grabTemplate = grabTemplate;
            this.render = render;
            this.translate = i18n.translate;
            this.translateKeys = i18n.translateKeys;
            this.util = util;
            this.escapeHtml = escapeHtml;

        }

        return InterfaceApp;
    });

