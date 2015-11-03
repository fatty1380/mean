'use strict';

var AppConfig = (function () {
    var appModuleName = 'truckerline',
        appModuleDependencies = [
            'ionic',
            'ui.router',
            'ionic.rating',
            'ngCordova.plugins.file',
            'ngCordova.plugins.fileTransfer',
            'ngIOS9UIWebViewPatch',
            'monospaced.elastic'
        ],
        registerModule = function (moduleName, dependencies) {
            // create angular module
            angular.module(moduleName, dependencies || []);
            // Add the module to the AngularJS configuration file
            angular.module(appModuleName).requires.push(moduleName);
        },
        debug = false;

    return {
        appModuleName: appModuleName,
        appModuleDependencies: appModuleDependencies,
        registerModule: registerModule,
        debug: debug
    };
})();

