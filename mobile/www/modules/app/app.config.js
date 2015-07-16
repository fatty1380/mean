'use strict';

var AppConfig = (function () {
    var appModuleName = 'outset',
        appModuleDependencies = ['ionic', 'ui.router'],
        registerModule = function (moduleName, dependencies) {
            // create angular module
            angular.module(moduleName, dependencies || []);
            // Add the module to the AngularJS configuration file
            angular.module(appModuleName).requires.push(moduleName);
        };

    return {
        appModuleName: appModuleName,
        appModuleDependencies: appModuleDependencies,
        registerModule: registerModule
    };
})();

