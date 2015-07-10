(function () {
    'use strict';

    angular
        .module('outset', [
            'ionic',
            'ui.router',
            'home',
            'login',
            'signup',
            'profile',
            'directives'
        ])
        .config([
            '$urlRouterProvider', function ($urlRouterProvider) {
                $urlRouterProvider.otherwise("/signup");
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