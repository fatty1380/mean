(function () {
    'use strict';

    function handleBadRoute($injector, $location) {
        console.log('Unknown URL pattern: %s', $location.url());

        $injector.invoke(['Authentication', '$log', '$state', function (auth, $log, $state) {
            if (!auth.isLoggedIn()) {
                $location.path('/');
            }
            else {
                switch (auth.user.type) {
                    case 'driver':
                        $log.debug('[Route.Otherwise] Re-Routing to driver\'s profile page');
                        $state.go('users.view');
                        $location.path('/home');
                        break;
                    case 'owner':
                        $log.debug('[Route.Otherwise] Re-Routing to the user\'s company home');
                        $state.go('companies.home');
                        $location.path('/home');
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

        // High Level Abstract Parent States
            state('fixed-opaque', {
            abstract: true,
            templateUrl: '/modules/core/views/fixed-opaque.client.view.html'
        }).
            state('headline-bg',
            {
                abstract: true,
                templateUrl: '/modules/core/views/headline-bg.client.view.html'
            }).

            state('profile-base', {
            abstract: true,
            views: {
                '': {
                    templateUrl: '/modules/core/views/profile-base.client.template.html'
                },
                'content@profile-base': {
                    template: '<h1 class="text-center">CONTENT</h1>'
                },
                'sidebar@profile-base': {
                    templateUrl: '/modules/drivers/views/templates/my-driver-sidebar.client.view.html',
                    controller: ['user', 'driver', 'Friends', function (user, driver, Friends) {
                        var vm = this;
                        vm.user = user;
                        vm.driver = driver;
                        vm.friends = null;

                        initialize();
                                
                        ////////////////////////////////////
                                
                        function initialize() {
                            var friendOne = _.first(vm.user.friends);

                            if (_.isString(friendOne)) {
                                Friends.query({ user: vm.user.id }).then(
                                    function (results) {
                                        vm.friends = results;
                                    });
                            } else {
                                vm.friends = vm.user.friends;
                            }
                        }

                    }],
                    controllerAs: 'vm',
                    bindToController: true
                }
            },
            resolve: {
                user: ['Authentication', '$stateParams', function resolveUser(Authentication, $stateParams) {
                    $stateParams.userId = $stateParams.userId || Authentication.isLoggedIn() && Authentication.user.id || '';
                    return Authentication.user;
                }],
                driver: ['user', 'Drivers', function resolveDriver(user, Drivers) {
                    return !!user.driver ? Drivers.get(user.driver) : null;
                }],
                company: ['user', 'Companies', function resolveCompany(user, Companies) {
                    return !!user.company ? Companies.get(user.company) : null;
                }]
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
            controller: ['$state', 'Authentication', '$timeout', function ($state, auth, $timeout) {
                debugger;
                $timeout(function () {
                    if (!auth.user) {
                        $state.go('intro.owner');
                    }
                    else if (auth.user.isDriver) {
                        //$state.go('drivers.home');
                        $state.go('feed.list', { userId: auth.user.id });
                    }
                    else if (auth.user.isOwner) {
                        $state.go('companies.home');
                    } else {
                        $state.go('intro');
                    }
                }, 1000);
            }]
        }).
            
        /// Page - Specific States

            state('privacy', {
            url: '/privacy',
            templateUrl: '/modules/core/views/templates/privacy.template.html',
            parent: 'fixed-opaque'
        });
    }

    handleBadRoute.$inject = ['$injector', '$location', '$state', 'Authentication', '$log'];
    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    // Setting up route
    angular
        .module('core')
        .config(config);
})();
