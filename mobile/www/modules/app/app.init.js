(function () {
    'use strict';

    // creating main application module
    angular
        .module(AppConfig.appModuleName, AppConfig.appModuleDependencies)
        .config([
            '$urlRouterProvider', function ($urlRouterProvider) {
                console.warn('unknown route or url: ' + location.hash);
                $urlRouterProvider.otherwise('home');
            }
        ])

        .run(function($ionicPlatform) {
            $ionicPlatform.ready(function() {
                if(window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if(window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        });
})();
