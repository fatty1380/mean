(function () {
    'use strict';

    function config($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.

            state('full-clear', {
                abstract: true,
                templateUrl: 'modules/core/views/full-clear.client.view.html'
            }).

            state('full-opaque', {
                abstract: true,
                templateUrl: 'modules/core/views/full-opaque.client.view.html'
            }).

            state('fixed-clear', {
                abstract: true,
                templateUrl: 'modules/core/views/fixed-clear.client.view.html',
                parent: 'full-clear'
            }).

            state('fixed-opaque', {
                abstract: true,
                templateUrl: 'modules/core/views/fixed-opaque.client.view.html',
                parent: 'full-clear'
            }).

            state('headline-bg', {
                abstract: true,
                templateUrl: 'modules/core/views/headline-bg.client.view.html',
                parent: 'full-clear'
            }).

            state('intro', {
                url: '/',
                templateUrl: 'modules/core/views/intro.client.view.html'
                //templateUrl: 'modules/landing/views/landing.client.view.html'
            }).

            state('home', {
                url: '/h'
            });
    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    // Setting up route
    angular
        .module('core')
        .config(config);
})();
