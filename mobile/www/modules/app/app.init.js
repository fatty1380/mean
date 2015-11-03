(function () {
    'use strict';

    // creating main application module
    angular
        .module(AppConfig.appModuleName, AppConfig.appModuleDependencies)
        .config([
            '$urlRouterProvider', function ($urlRouterProvider) {
                //console.warn('unknown route or url: ' + location.hash);
                $urlRouterProvider.otherwise('home');
            }
        ])
        .config(['$ionicConfigProvider', function ($ionicConfigProvider) {
            $ionicConfigProvider.tabs.position('bottom');
        }])

        .config(['$compileProvider', function ($compileProvider) {
            // disable debug info
            $compileProvider.debugInfoEnabled(AppConfig.debug);
        }])
        .config(['msdElasticConfig', function (config) {
            config.append = '\n';
        }])

        .run(initializePlatform);

    initializePlatform.$inject = ['$ionicPlatform', '$window', 'settings']

    function initializePlatform($ionicPlatform, $window, settings) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            ionic.Platform.isFullScreen = true;

            if (!!screen && angular.isFunction(screen.lockOrientation)) {
                screen.lockOrientation('portrait');
            }
        });
})();
