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

define(['config', 'logger', 'gamePosition', 'pixi', 'gameEvents', 'gameApp', 'tween', 'gameFloor'],
    function (config, Logger, gamePosition, pixi, events, gameApp, tween, GameFloor) {

        var instance,
            logger = Logger.getLogger('pixiTiles');
        logger.setLevel(config.logger.pixiTiles || 0);

        var tileSize = config.game.tiles.size,
            chunkSize = config.game.chunks.size;

        function getInstance() {
            if (!instance) {
                instance = new PixiTilesLayer();
            }
            return instance;
        }

        /**
         *Grid
         * @constructor
         */
        function Grid() {
            pixi.Graphics.call(this);
            this.gamePosition = gamePosition.factory(this);
            var x = 30 * tileSize - tileSize / 2;
            this.lineStyle(3, 0x808080, .3);

            for (var i = -x; i <= x; i += tileSize) {
                this.moveTo(i, -x);
                this.lineTo(i, x);
                this.moveTo(-x, i);
                this.lineTo(x, i);
            }
            this.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
        }

        Grid.prototype = Object.create(pixi.Graphics.prototype);
        Grid.prototype.constructor = Grid;


        /**
         * Chunk
         * @constructor
         */
        function Chunk() {
            pixi.Graphics.call(this);
            this.gamePosition = gamePosition.factory(this);
            var x = 6 * tileSize * chunkSize + tileSize / 2;
            this.lineStyle(4, 0x000000, .3);

            for (var i = -x; i <= x; i += tileSize * chunkSize) {
                this.moveTo(i, -x);
                this.lineTo(i, x);
                this.moveTo(-x, i);
                this.lineTo(x, i);
            }
            this.hitArea = new pixi.Rectangle(-x, -x, x * 2, x * 2);
        }

        Chunk.prototype = Object.create(pixi.Graphics.prototype);
        Chunk.prototype.constructor = Chunk;

        /**
         * Cursor
         * @constructor
         */
        function Cursor() {
            pixi.Graphics.call(this);
            this.gamePosition = gamePosition.factory(this);
            var x = tileSize / 2;
            this.lineStyle(6, 0x000000, .5);
            this.moveTo(-x, -x);
            this.lineTo(x, -x);
            this.lineTo(x, x);
            this.lineTo(-x, x);
            this.lineTo(-x, -x);


        }

        Cursor.prototype = Object.create(pixi.Graphics.prototype);
        Cursor.prototype.constructor = Cursor;

        /**
         * Pointer
         * @constructor
         */
        function Pointer() {

            pixi.Container.call(this);
            var x = tileSize / 2,
                alpha = .5;

            this.gamePosition = gamePosition.factory(this);

            var gr = new pixi.Graphics();
            gr.lineStyle(6, 0xcc0000, alpha);
            gr.moveTo(-x, -x);
            gr.lineTo(x, -x);
            gr.lineTo(x, x);
            gr.lineTo(-x, x);
            gr.lineTo(-x, -x);

            this.addChild(gr);

            var text = new pixi.Text();


            this.fadeOut = function () {
                this.alpha = Math.max(0, this.alpha - fade);
            };

            this.show = function () {
                this.alpha = alpha;
            }
        }

        Pointer.prototype = Object.create(pixi.Container.prototype);
        Pointer.prototype.constructor = Pointer;

        function Path() {
            pixi.Container.call(this);
            var graph = new pixi.Graphics(),
                animate = new tween.Tween({
                    get alpha() {
                        return graph.alpha
                    },
                    set alpha(a) {
                        graph.alpha = a;
                    }
                });

            this.addChild(graph);

            events.game.frameTick(function (t) {
                animate.update(t);
            });

            this.drawPath = function (path) {
                graph.clear();
                graph.alpha = .7;

                for (var i = 0; i < path.length; i++) {
                    var p = path[i];
                    graph.beginFill(0);
                    graph.drawCircle(p.x * tileSize, p.y * tileSize, 7);
                    graph.endFill();
                    graph.beginFill(0xababab);
                    graph.drawCircle(p.x * tileSize, p.y * tileSize, 5);
                    graph.endFill();
                }

                animate.to({alpha: .2}, 2000).start();

            };
        }

        Path.prototype = Object.create(pixi.Container.prototype);
        Path.prototype.constructor = Path;

        /**
         *
         * @constructor
         */
        function PixiTilesLayer() {
            pixi.Container.call(this);

            var grid = new Grid(),
                //chunk = new Chunk(),
                path = new Path(),
                cursor = new Cursor(),
                pointer = new Pointer(),
                tilesGrid = new GameFloor(),
                animatePointer = new tween.Tween({
                    get alpha() {
                        return pointer.alpha
                    },
                    set alpha(a) {
                        pointer.alpha = a;
                    }
                });


            this.addChild(grid);
            //this.addChild(chunk);
            this.addChild(tilesGrid);
            this.addChild(path);
            this.addChild(cursor);
            this.addChild(pointer);


            events.mainPlayer.showWalkPath(function (p) {
                p.length && path.drawPath(p);
            });


            this.interactive = true;

            events.game.frameTick(function (t) {
                var mouse = gameApp.get('mouse');
                var mouseGrid = mouse.position.grid;
                cursor.gamePosition.grid.x = mouseGrid.x;
                cursor.gamePosition.grid.y = mouseGrid.y;

                if (mouse.isDown) {
                    pointer.alpha = .5;
                    setPointer();
                } else {
                    animatePointer.update(t);
                }

                var gameGrid = gameApp.get('screen').position.grid;
                grid.gamePosition.grid.x = gameGrid.x * -1;
                grid.gamePosition.grid.y = gameGrid.y * -1;

                /*
                 // debug grid position
                 chunkGrid = gameApp.get('screen').position.chunk;

                 chunk.gamePosition.chunk.x = chunkGrid.x *-1  -1;
                 chunk.gamePosition.chunk.y = chunkGrid.y *-1  -1;
                 */
            });

            // update pointer on mouse up and down
            events.game.mouseDown(setPointer);
            events.game.mouseUp(function showPointer() {
                setPointer();
                animatePointer.to({alpha: 0}, 2000).start();
            });


            function setPointer() {
                var mouseGrid = gameApp.get('mouse').position.grid;
                pointer.gamePosition.grid.x = mouseGrid.x;
                pointer.gamePosition.grid.y = mouseGrid.y;
            }


        }

        PixiTilesLayer.prototype = Object.create(pixi.Container.prototype);
        PixiTilesLayer.prototype.constructor = PixiTilesLayer;

        return getInstance();
    });