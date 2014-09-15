'use strict';

function config($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');

    // Home state routing
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'modules/core/views/home.client.view.html'
        })
        .state('driver', {
            // TODO: Determine if this is the correct way to route differently
            url: '/',
            templateUrl: 'modules/users/views/settings/profile.client.view.html'
        });
}

config.$inject = ['$stateProvider', '$urlRouterProvider'];

// Setting up route
angular
    .module('core')
    .config(config);
