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


define(['config', 'logger', 'jquery', 'underscore', 'backbone', 'interfaceApp', 'gameEvents', 'gameApp'],
    function (config, Logger, $, _, Backbone, interfaceApp, events, gameApp) {

        var instance,
            logger = Logger.getLogger('interfaceLogin');

        logger.setLevel(config.logger.interfaceLogin || 0);

        return getInstance();
        function getInstance() {
            if (!instance) {
                instance = createLogin();
            }
            return instance;
        }

        function createLogin() {

            return new (Backbone.View.extend(_.extend(new interfaceApp(), {
                /**
                 * backbone
                 */
                el: $('#window-game-login'),
                el_user: '#input-game-login-name',
                el_pwd: '#input-game-login-pwd',
                el_pwd2: '#input-game-login-pwd2',
                el_reg: '#ck-game-register',
                el_msg: '#game-login-message',
                el_btLogin: '#button-game-login',
                el_btRegister: '#button-game-register',
                el_trPass2: '#row-login-pwd2',
                events: {
                    'click #button-game-login': 'login',
                    'click #button-game-register': 'register',
                    //'click #input-game-login-name, #input-game-login-pwd, #input-game-login-pwd2': 'resetMessage',
                    'change #ck-game-register': 'switchRegister',
                    'keyup #input-game-login-pwd, #input-game-login-pwd2': 'checkPasswords'
                },
                initialize: function () {
                    // grap template
                    var self = this;
                    this.grabTemplate();
                    this.viewData = this.translateKeys('login', [
                        'login', 'register', 'username', 'password'
                    ]);
                    // custom events
                    events.global.windowResize(this, this.centerWindow);
                    events.interface.hideAll(this, this.hide);

                    events.server.connect(this, this.show);

                    events.server.logout(this, function(msg){
                        events.interface.hideAll.trigger();
                        $(this.el_msg).html(msg);
                        self.show();
                    });

                    events.game.loginSuccess(this, function(user){
                        $(this.el_msg).html(this.translate('login.login success'));
                        this.hide();
                        events.global.windowResize.trigger();
                    });

                    events.server.login(this, function(login){
                        if(login){
                            try {
                                if (login.success) {
                                    logger.info('Login success');
                                    events.game.loginSuccess.trigger(login.user);
                                } else {
                                    $(this.el_msg).html(login.msg || this.translate('login.login failed'));
                                }
                            } catch (e) {
                                logger.error(e, login);
                            }
                        }else{
                            events.interface.hideAll.trigger();
                            this.show();
                        }
                    });
                    events.server.register(this, function(trial){
                        if (trial.success) {
                                if ($(this.el_reg).is(':checked')) {
                                    $(this.el_reg).click();
                                    this.switchRegister();
                                }
                                $(this.el_msg).html(this.translate('login.register success'));
                            } else {
                                $(this.el_msg).html(trial.msg || this.translate('login.register failed'));
                            }
                    });

                },
                login: function () {
                    this.resetMessage();
                    var user = ($(this.el_user).val() || '');
                    var pwd = ($(this.el_pwd).val() || '');
                    if (user && pwd) {
                        localStorage['server.login.user'] = user;
                        gameApp.work(events.server.login, {user: user, pwd: pwd});
                    } else {
                        $(this.el_msg).text(this.translate('login.loginDataIncomplete'));
                    }
                }
                ,
                register: function () {
                    this.resetMessage();
                    var name = $(this.el_user).val(),
                        pwd = $(this.el_pwd).val();
                    if (this.checkPasswords() && name && pwd) {
                        gameApp.work(events.server.register, {name: name, pwd: pwd});
                    }
                }
                ,
                switchRegister: function () {
                    if ($(this.el_reg).is(':checked')) {
                        $(this.el_trPass2).show();
                        $(this.el_btLogin).hide();
                        $(this.el_btRegister).show();
                    } else {
                        $(this.el_trPass2).hide();
                        $(this.el_btLogin).show();
                        $(this.el_btRegister).hide();
                    }
                },
                checkPasswords: function () {
                    if (!$(this.el_reg).is(':checked')) return false;
                    var p1 = $(this.el_pwd).val(),
                        p2 = $(this.el_pwd2).val();
                    if (!p1 || !p2 || p1 != p2) {
                        $(this.el_msg).text(this.translate('login.passwords not same'));
                        return false;
                    } else {
                        this.resetMessage();
                        return true;
                    }
                }
                ,
                resetMessage: function () {
                    $(this.el_msg).html('&nbsp;');
                }
                ,
                show: function () {
                    this.render();
                    this.switchRegister();
                    this.centerWindow();
                    $(this.el_user).val(localStorage['server.login.user'] || '');
                    this.$el.fadeIn();
                }
            })))();

        }
    })
;
