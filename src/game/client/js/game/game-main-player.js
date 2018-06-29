/**
 * Created by stefan on 28.12.16.
 */


define(['config', 'logger', 'gamePlayer', 'debugInfo', 'gameEvents', 'tween', 'gameApp'],
    function (config, Logger, Player, DebugInfo, events, tween, gameApp) {

        var logger = Logger.getLogger('gameMainPlayer');
        logger.setLevel(config.logger.gameMainPlayer || 0);

        var tileSize = config.game.tiles.size;

        function MainPlayer(user) {
            Player.call(this, user);
            var self = this,
                playerGridMoved = events.mainPlayer.gridMoved,
                lastGridMove = {x: 0, y: 0},
                animate = new tween.Tween(this.gamePosition),
                debug = new DebugInfo(this, 50, 200).debug;

            //animate.easing(tween.Easing.Quintic.InOut);

            // make debug display public for abuse
            this.debug = debug;

            // register mainPlayer to gameApp
            gameApp.set('mainPlayer', this);

            events.mainPlayer.walk(walk);
            /**
             * animate player to given position
             * @param pos {{x: int, y: int, speed: int}}
             */
            function walk(pos) {
                animate.to({
                        x: pos.x * tileSize,
                        y: pos.y * tileSize
                    },
                    pos.speed).start();
                gameApp.work(events.mainPlayer.gridMoving, {
                    mousePosition: gameApp.get('mouse').position.worker,
                    playerPosition: self.gamePosition.worker
                })
            }


            events.game.frameTick(function (t, l) {
                animate.update(t);

                var grid = self.gamePosition.grid,
                    mouse = gameApp.get('mouse'),
                    screen = gameApp.get('screen');

                if(grid.x != lastGridMove.x || grid.y != lastGridMove.y){
                    lastGridMove.x = grid.x;
                    lastGridMove.y = grid.y;
                    playerGridMoved.trigger(self.gamePosition);
                    gameApp.work(playerGridMoved, self.gamePosition.worker);
                }



                /*
                debug({
                    time: Math.round(t),
                    load: Math.round(l),
                    screen: screen,
                    mousePos: mouse.position.tile
                });
                */

            });

            events.game.mouseUp(function (mousePosition) {
            });


            events.game.mouseDown(function (mousePosition) {
            });


        }

        MainPlayer.prototype = Object.create(Player.prototype);
        MainPlayer.prototype.constructor = MainPlayer;

        return MainPlayer;

    });