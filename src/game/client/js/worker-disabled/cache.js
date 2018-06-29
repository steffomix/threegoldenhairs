

define(['config', 'logger', 'underscore', 'workerSocket', 'workerRouter', 'server', 'cacheFloorManager', 'workerMainPlayer'],
    function (config, Logger, _, socket, router, server, floorManager) {

        var instance,
            logger = Logger.getLogger('gameCache');
        logger.setLevel(config.logger.gameCache || 0);

        logger.info('Load Interfaces');


        return getInstance();

        function getInstance() {
            if (!instance) {
                instance = new GameCache();
            }
            return instance;
        }


        function GameCache() {
            // register at game-websocket to receive commands
            router.addModule('cache', this, {
                onUpdateFloor: function (job) {
                    floorManager.updateFloor(job.data);
                },
                onUpdateTile: function(job){
                    floorManager.updateTile(job.data);
                }
            });

        }

    });

