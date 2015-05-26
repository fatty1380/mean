(function () {
    'use strict';

    function handleBadRoute($injector, $location) {
        console.log('Unknown URL pattern: %s', $location.url());

        $injector.invoke(['Authentication', '$log', function (auth, $log) {
            if (!auth.isLoggedIn()) {
                $location.path('/');
            }
            else {
                switch (auth.user.type) {
                    case 'driver':
                        $log.debug('[Route.Otherwise] Re-Routing to driver\'s profile page');
                        $location.path('/drivers/home');
                        break;
                    case 'owner':
                        $log.debug('[Route.Otherwise] Re-Routing to the user\'s company home');
                        $location.path('/companies/home');
                        break;
                    default:
                        $log.warn('[Route.Otherwise] Unknown Destination');
                        $location.path('/');
                }
            }

        }]);
    }

    function config($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise(handleBadRoute);

        // Home state routing
        $stateProvider.

            state('privacy', {
                url: '/privacy',
                templateUrl: '/modules/core/views/templates/privacy.template.html',
                parent: 'fixed-opaque'
            }).

            state('fixed-opaque', {
                abstract: true,
                templateUrl: '/modules/core/views/fixed-opaque.client.view.html'
            }).

            state('headline-bg', {
                abstract: true,
                templateUrl: '/modules/core/views/headline-bg.client.view.html'
            }).

            state('intro', {
                url: '/',
                template: '<div ui-view></div>',
                controller: ['$state', '$timeout', function ($state, $timeout) {
                    if ($state.is('intro')) {
                        $timeout(function () {
                            $state.go('intro.driver');
                        }, 0);
                    }
                }]

            }).

            state('intro.driver', {
                url: 'd',
                templateUrl: '/modules/core/views/intro.client.view.html',
                parent: 'intro',
                controller: 'HomeController',
                controllerAs: 'vm'
            }).

            state('intro.owner', {
                url: 'o',
                templateUrl: '/modules/core/views/intro.client.view.html',
                parent: 'intro',
                controller: 'HomeController',
                controllerAs: 'vm'
            }).

            state('home', {
                url: '/home',
                controller: ['$state', 'Authentication', '$timeout', function ($state, auth, $timeout) {
                    debugger;
                    $timeout(function () {
                        if (!auth.user) {
                            $state.go('intro.owner');
                        }
                        else if (auth.user.isDriver) {
                            $state.go('drivers.home');
                        }
                        else if (auth.user.isOwner) {
                            $state.go('companies.home');
                        } else {
                            $state.go('intro');
                        }
                    }, 1000);
                }]
            });
    }

    handleBadRoute.$inject = ['$injector', '$location', '$state', 'Authentication', '$log'];
    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    // Setting up route
    angular
        .module('core')
        .config(config);
})();
