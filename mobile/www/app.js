(function () {
    'use strict';

    angular
        .module('outset', [
            'ionic',
            'ui.router',
            'home',
            'login',
            'signup',
            'account',
            'directives'
        ])
        .config([
            '$urlRouterProvider', function ($urlRouterProvider) {
                $urlRouterProvider.otherwise("/signup/register");
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
