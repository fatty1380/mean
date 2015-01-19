'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () { // jshint ignore:line
    // Init module configuration options
    var applicationModuleName = 'outset';
    var applicationModuleVendorDependencies =
            ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap',
                'ui.utils', 'angularFileUpload', 'textAngular', 'ngMap',
                'pdf', 'ngImgCrop', 'duScroll'];

    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
        // Create angular module
        angular.module(moduleName, dependencies || []);

        // Add the module to the AngularJS configuration file
        angular.module(applicationModuleName).requires.push(moduleName);
    };

    return {
        applicationModuleName: applicationModuleName,
        applicationModuleVendorDependencies: applicationModuleVendorDependencies,
        registerModule: registerModule
    };
})();

