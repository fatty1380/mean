(function() {
    'use strict';

    function config($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.

        state('intro', {
            url: '/',
            templateUrl: 'modules/core/views/intro.client.view.html'
        });
    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    // Setting up route
    angular
        .module('core')
        .config(config);
})();
