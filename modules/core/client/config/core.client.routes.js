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

            state('superbase', {
                abstract:true,
                template: '<div ui-view class="superbase"  autoscroll="true"></div>',
                params: {
                    'delay' : {
                        value: '0',
                        squash: true
                    }
                },
                resolve : {
                    waitforit : function($stateParams, $timeout) {
                        if(!!$stateParams.delay) {
                            debugger;
                            console.log('Waiting for %d seconds', $stateParams.delay);
                            $timeout(function() { return 'waited'; }, $stateParams.delay*1000);
                        }
                        else {
                            return 'go ahead';
                        }
                    }
                }
            }).

            state('privacy', {
                url: '/privacy',
                templateUrl: 'modules/core/views/templates/privacy.template.html',
                parent: 'fixed-opaque'
            }).

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
                templateUrl: 'modules/core/views/intro.client.view.html',
                parent: 'superbase'
                //templateUrl: 'modules/landing/views/landing.client.view.html'
            }).

            state('home', {
                url: '/h'
            });
    }

    handleBadRoute.$inject = ['$injector', '$location', '$state', 'Authentication', '$log'];
    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    // Setting up route
    angular
        .module('core')
        .config(config);
})();
