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
                        controller: ['user', 'profile', 'Friends', function (user, profile, Friends) {
                            var vm = this;
                            vm.user = user;
                            vm.profile = profile;
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
                    profile: ['user', '$stateParams', 'Profiles', function resolveProfile(user, $stateParams, Profiles) {
                        if (!_.isEmpty($stateParams.userId) && !!user && $stateParams.userId != user.id) {
                            return Profiles.load($stateParams.userId);
                        }

                        return user;
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
                controller: ['$state', 'LoginService', function ($state, LoginService) {
                    LoginService.getUser().then(
                        function success(user) {
                            
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
                        })
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
