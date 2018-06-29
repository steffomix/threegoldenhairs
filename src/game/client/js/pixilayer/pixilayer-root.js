/*
 * Copyright (C) 25.12.16 Stefan Brinkmann <steffomix@gmail.com>
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

define(['config', 'logger', 'jquery', 'gamePosition', 'debugInfo', 'pixi', 'tween', 'gameEvents', 'gameApp',
        'pixiTiles',
        'pixiPlayers'],
    function (config, Logger, $, position, DebugInfo, pixi, tween, events, gameApp,
              playerContainer,
              tilesContainer) {

        var instance,
            renderer = pixi.autoDetectRenderer(100, 100, {transparent: 1}),
            // renderer = new pixi.CanvasRenderer(100, 100, {transparent: 1}),
            $gameStage = $('#game-stage'),
            $body = $('body'),
            tileSize = config.game.tiles.size,
            scale = config.game.tiles.scale,
            logger = Logger.getLogger('pixiRoot');
        logger.setLevel(config.logger.pixiRoot || 0);


        /**
         *
         * @param self {{x, y}}
         * @param smooth {number}
         * @returns {{x, y}}
         */
        function smoothMove(self, smooth) {
            return {
                get x() {
                    return self.x;
                },
                set x(x) {
                    self.x += (x - self.x) / smooth;
                },
                get y() {
                    return self.y;
                },
                set y(y) {
                    self.y += (y - self.y) / smooth;
                },
                set smooth(s){
                    smooth = s;
                },
                /**
                 * @param pos {{x, y}}
                 */
                move: function (pos) {
                    this.x = pos.x;
                    this.y = pos.y;
                }

            }
        }

        function PixiRootLayer() {
            pixi.Container.call(this);

            var self = this,
                triggerMouseMove = events.game.mouseMove.claimTrigger(this),
                triggerMouseUp = events.game.mouseUp.claimTrigger(this),
                triggerMouseDown = events.game.mouseDown.claimTrigger(this),
                triggerMouseGridMove = events.game.mouseGridMove.claimTrigger(this),
                triggerScreenGridMove = events.game.screenGridMove.claimTrigger(this),
                debug = new DebugInfo(this, 400, 400).debug,

                /**
                 * do not use lastMouseMove directly
                 */
                lastMouseMove = position.factory({x: 0,y: 0}),
                mousePosition = position.factory(self, lastMouseMove),

                lastMouseGridMove = position.factory({x: 0, y: 0}),
                lastScreenGridMove = position.factory({x: 0, y: 0}),

                lastPlayerMove = position.factory({x: 0, y: 0}),

                mouseDown = false,
                gamePosition = position.factory({
                    get x() {
                        return ((self.x / scale) - $body.width() / 2 / scale) + tileSize / 2;
                    },
                    get y() {
                        return ((self.y / scale) - $body.height() / 2 / scale) + tileSize / 2;
                    }
                }),
                playerOffset = {
                    get x() {
                        return gamePosition.x - moveTo.x;
                    },
                    get y() {
                        return gamePosition.y - moveTo.y;
                    }
                },
                moveTo = {
                    x: 0,
                    y: 0
                },
                moveAcc = smoothMove({x: 0, y: 0}, 10),
                // the heigher the slower
                moveSpeed = 100;


            // add mouse button state to mouse position
            Object.defineProperty(mousePosition, 'isDown', {
                get: function () {
                    return mouseDown;
                }
            });

            // add layers
            this.addChild(playerContainer);
            this.addChild(tilesContainer);

            // catch all mouse events
            this.interactive = true;
            this.setTransform(0, 0, scale, scale);


            function onMouseMove(e) {
                if(gameApp.get('mainPlayer')){
                    lastMouseMove.x = e.data.global.x;
                    lastMouseMove.y = e.data.global.y;
                    triggerMouseMove(mousePosition, e);

                    var move = mousePosition.grid,
                        lastMove = lastMouseGridMove.grid;

                    if(!move.eq(lastMove)){
                        lastMove.x = move.x;
                        lastMove.y = move.y;
                        onMouseGridMove();
                    }
                }
            }

            /**
             * subtrigger of onMouseMove
             */
            function onMouseGridMove(){
                if(gameApp.get('mainPlayer')){
                    gameApp.work(events.game.mouseGridMove, positionWorker());
                }
                positionWorker();
                triggerMouseGridMove(mousePosition);
            }

            function onMouseDown(e) {
                mouseDown = true;
                triggerMouseDown(mousePosition, e);
            }

            function onMouseUp(e) {

                if(gameApp.get('mainPlayer')){
                    gameApp.work(events.mainPlayer.walk, positionWorker());
                }
                mouseDown = false;
                triggerMouseUp(mousePosition, e);
            }


            function positionWorker() {
                return {
                        gamePosition: gamePosition.worker,
                        mousePosition: mousePosition.worker,
                        playerPosition: gameApp.get('mainPlayer').gamePosition.worker,
                        isDown: mouseDown
                    }
            }


            // move container to center of mainPlayer
            events.game.frameTick(function () {

                var mainPlayer = gameApp.get('mainPlayer'),
                    screen = gameApp.get('screen');
                if(mainPlayer){

                    moveTo.x = mainPlayer.x * -1 + tileSize * scale;
                    moveTo.y = mainPlayer.y * -1 + tileSize * scale;

                    //moveSpeed = 10 + 100 / ((Math.abs(screen.playerOffset.x) + Math.abs(screen.playerOffset.y)) / tileSize)
                    // skip smooth scroll on extrem fast moves or teleports
                    if(Math.abs(screen.playerOffset.x) > screen.width || Math.abs(screen.playerOffset.y) > screen.height){
                        // gamePosition.x = moveTo.x * -1;
                        // gamePosition.y = moveTo.y * -1;
                        // return;
                    }

                    mainPlayer.debug({
                        root: {
                            x: gamePosition.x,
                            y: gamePosition.y
                        },
                        player: {
                            x: mainPlayer.x,
                            y: mainPlayer.y
                        }
                    })

                    var diff = gamePosition.diff(moveTo, .2, .2);
                    moveAcc.move(diff);

                    self.x += moveAcc.x / moveSpeed;
                    self.y += moveAcc.y / moveSpeed;

                    var playerGrid = mainPlayer.gamePosition.grid,
                        lastPlayerGrid = lastPlayerMove.grid;

                    if(!playerGrid.eq(lastPlayerGrid)){
                        lastPlayerGrid.x = playerGrid.x;
                        lastPlayerGrid.y = playerGrid.y;
                        triggerScreenGridMove(gamePosition);
                        gameApp.work(events.game.screenGridMove, positionWorker());
                    }
                }

                renderer.render(self);
            });

            events.game.initialize(function () {
                $gameStage.html(renderer.view);
                logger.info('Game initialize pixiRoot');
                gameApp.set('mouse', {
                    get position(){
                        return mousePosition;
                    },
                    get isDown() {
                        return mouseDown;
                    }
                });
                gameApp.set('screen', {
                    get position(){
                        return gamePosition;
                    },
                    get width() {
                        return $body.width();
                    },
                    get height() {
                        return $body.height();
                    },
                    get playerOffset() {
                        return playerOffset;
                    }
                });
                // activate mouse events
                self.on('mousemove', onMouseMove)
                    .on('mousedown', onMouseDown)
                    .on('mouseup', onMouseUp)
                    // touch events
                    .on('touchmove', onMouseMove)
                    .on('touchstart', onMouseDown)
                    .on('touchend', onMouseUp);
            });

            // resize stage
            events.global.windowResize(function () {
                renderer.resize($body.width(), $body.height());
            });


        }

        PixiRootLayer.prototype = Object.create(pixi.Container.prototype);
        PixiRootLayer.prototype.constructor = PixiRootLayer;


        function getInstance() {
            if (!instance) {
                instance = new PixiRootLayer();
                new pixi.Container().addChild(instance);
            }
            return instance;
        }

        return getInstance();
    });