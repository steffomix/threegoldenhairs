/**
 * Created by stefan on 12.01.17.
 */


importScripts('/js/lib/require.js');
importScripts('/js/config.js');

/**
 * collect modules to preload
 */
require(['config', 'gameEvents'], function (config, events) {

    var paths = config.requirejs.paths,
        groups = ['worker'],
        preloadModules = ['gameEvents', 'underscore', 'workerMainPlayer'];


    for (var module in paths) {
        if (paths.hasOwnProperty(module)) {
            var path = paths[module];
            groups.forEach(function (group) {
                if (path.indexOf(group + '/') === 0) {
                    preloadModules.push(module);
                }
            })
        }
    }

// preload some modules and connect event events to window
    define('modulesLoader', preloadModules, function (events) {

        console.info('Worker preload modules: ', preloadModules);
        return arguments;
    });

});

/**
 * main worker app
 */
define('workerApp', [], function () {

    var modules = {},
        gameApp = {
            get send() {
                return send;
            },
            get addModule() {
                return addModule;
            }
        };

    return gameApp;

    function send(event, data) {
        event.worker(self, data);
    }

    function addModule(name, module) {
        if (!gameApp[name]) {
            Object.defineProperty(modules, name, module);
        }
    }

});

/**
 * start worker app
 */
require(['workerApp', 'gameEvents', 'modulesLoader'], function (workerApp, events, loader) {

    self.addEventListener('message', function (e) {
        try {
            if (e.data.event) {
                if (events[e.data.event[0]] && events[e.data.event[0]][e.data.event[1]]) {
                    events[e.data.event[0]][e.data.event[1]].trigger(e.data.data);
                } else {
                    console.error('Dispatch Message form Worker not found: ', e.data.event, e.data);
                }
            } else {
                console.error('Dispatch Message from Worker has no event', e.data);
            }
        } catch (ex) {
            console.error('Dispatch Message from Worker: ', ex, e.data);
        }
    });
    workerApp.send(events.gameWorker.ready);
    console.info('Worker ready');

});