'use strict';

var AppConfig = (function () {
    var appModuleName = 'truckerline',
        appModuleDependencies = ['ionic', 'ui.router', 'ngIOS9UIWebViewPatch'],
        registerModule = function (moduleName, dependencies) {
            // create angular module
            angular.module(moduleName, dependencies || []);
            // Add the module to the AngularJS configuration file
            angular.module(appModuleName).requires.push(moduleName);
        },
        debug = true;

    return {
        appModuleName: appModuleName,
        appModuleDependencies: appModuleDependencies,
        registerModule: registerModule,
        debug: debug
    };
})();

