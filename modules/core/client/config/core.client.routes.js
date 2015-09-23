(function () {
    'use strict';

    handleBadRoute.$inject = ['$injector', '$location'];
    function handleBadRoute($injector, $location) {
        console.log('Unknown URL pattern: %s', $location.url());
        $location.path('/home');
        
        // $injector.invoke(['Authentication', '$log', '$state', function (auth, $log, $state) {
        //     if (!auth.isLoggedIn()) {
        //         $location.path('/');
        //     }
        //     else {
        //         switch (auth.user.type) {
        //             case 'driver':
        //                 $log.debug('[Route.Otherwise] Re-Routing to driver\'s profile page');
        //                 $state.go('users.view');
        //                 $location.path('/home');
        //                 break;
        //             case 'owner':
        //                 $log.debug('[Route.Otherwise] Re-Routing to the user\'s company home');
        //                 $state.go('companies.home');
        //                 $location.path('/home');
        //                 break;
        //             default:
        //                 $log.warn('[Route.Otherwise] Unknown Destination');
        //                 $location.path('/');
        //         }
        //     }

        // }]);
    }

    resolveUser.$inject = ['Authentication', 'LoginService'];
    function resolveUser(Authentication, LoginService) {
        debugger;
        return LoginService.getUser().then(
            function success(user) {

                if (!Authentication.user) {
                    debugger;
                    Authentication.user = user;
                }

                return user;
            },
            function reject(reason) {
                console.error('Unable to load user - not logged in?', reason);

                return null;
            });
    }

    function config($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise(handleBadRoute);

        // Home state routing
        $stateProvider.

        // High Level Abstract Parent States
            state('fixed-opaque', {
                abstract: true,
                templateUrl: '/modules/core/views/fixed-opaque.client.view.html',
                resolve: {
                    user: resolveUser
                }
            }).
            state('headline-bg',
                {
                    abstract: true,
                    templateUrl: '/modules/core/views/headline-bg.client.view.html',
                    resolve: {
                        user: resolveUser
                    }
                }).

            
            
        // Landing Page 'Intro' States

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
                controller: ['$state', 'LoginService', 'Authentication', function ($state, LoginService, Authentication) {
                    LoginService.getUser().then(
                        function success(user) {

                            if (!Authentication.user) {
                                debugger;
                                Authentication.user = user;
                            }

                            console.log('Success in looking up user, redirecting', user);
                            if (user.isDriver) {
                                //$state.go('drivers.home', {}, { reload: true });
                                $state.go('feed.list', { userId: user.id });
                            }
                            else if (user.isOwner) {
                                $state.go('companies.home');
                            } else {
                                $state.go('intro');
                            }
                        },
                        function reject(err) {
                            console.log('No user lookup, redirecting', err);
                            $state.go('intro.owner');
                        });
                }]
            }).
            
        /// Page - Specific States

            state('privacy', {
                url: '/privacy',
                templateUrl: '/modules/core/views/templates/privacy.template.html',
                parent: 'fixed-opaque'
            });
    }

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    // Setting up route
    angular
        .module('core')
        .config(config);
})();
