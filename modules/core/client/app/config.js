/* jshint -W097 */
'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () { // jshint ignore:line
    // Init module configuration options
    var applicationModuleName = 'outset';
    var applicationModuleVendorDependencies =
        [
            'ngSanitize', 'ngAnimate', 'ngResource', 'ngMessages',
            'ui.router', 'ui.bootstrap', 'ui.mask',
            'angularFileUpload', 'ngMap', 'toastr',
            'ngImgCrop', 'duScroll', 'angularMoment',
            'ngSignaturePad'
        ];

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
/* jshint +W097 */