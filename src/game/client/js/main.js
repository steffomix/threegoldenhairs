/*
 * Copyright (C) 16.11.16 Stefan Brinkmann <steffomix@gmail.com>
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


require(['config', 'gameEvents'], function(config, events){

    var paths = config.requirejs.paths,
        groups = ['bower', 'lib', 'game', 'pixilayer', 'interface'],
        preloadModules = ['backbone', 'jquery', 'gameEvents'];

    // collect list of modules to preload
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

    console.log('Preload modules: ', preloadModules);

    define('rottingUniverse', preloadModules, function (backbone, $, events) {
        backbone.$ = $;
    });

    console.log('game start...', performance.now())
    require(['rottingUniverse'], function () {

    });
});



















