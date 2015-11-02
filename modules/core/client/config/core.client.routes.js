(function () {
    'use strict';
    
    /** Core Routes & States:
     * 
     *  fixed-opaque    : abstract
     *                  : Root level template containing a single, fixed-width container overlayed on a short header
     *                  : resolves: 'user'
     *  headline-bg     : abstract
     *                  : Root level template containing a single, fixed-width container overlayed on a large header
     * 
     *  intro           : 
     */
    

    // Setting up route
    angular
        .module('core')
        .config(config);


    config.$inject = ['$stateProvider', '$urlRouterProvider'];
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
                abstract: true,
                template: '<div ui-view></div>',
                // controller: ['$state', '$timeout', function ($state, $timeout) {
                //     if ($state.is('intro')) {
                //         $timeout(function () {
                //             $state.go('intro.driver');
                //         }, 0);
                //     }
                // }]

            }).

            // state('intro.driver', {
            //     url: '',
            //     templateUrl: '/modules/core/views/intro.client.view.html',
            //     parent: 'intro',
            //     controller: 'HomeController',
            //     controllerAs: 'vm'
            // }).

            state('intro.owner', {
                url: '',
                templateUrl: '/modules/core/views/intro.client.view.html',
                parent: 'intro',
                controller: 'HomeController',
                controllerAs: 'vm'
            }).

            // state('home', {
            //     url: '/home',
            //     controller: ['$state', 'LoginService', 'Authentication', function ($state, LoginService, Authentication) {
            //         LoginService.getUser().then(
            //             function success(user) {

            //                 if (!Authentication.user) {
            //                     debugger;
            //                     Authentication.user = user;
            //                 }

            //                 console.log('Success in looking up user, redirecting', user);
            //                 if (user.isDriver) {
            //                     //$state.go('drivers.home', {}, { reload: true });
            //                     $state.go('feed.list', { userId: user.id });
            //                 }
            //                 else if (user.isOwner) {
            //                     $state.go('companies.home');
            //                 } else {
            //                     $state.go('intro');
            //                 }
            //             },
            //             function reject(err) {
            //                 console.log('No user lookup, redirecting', err);
            //                 $state.go('intro.owner');
            //             });
            //     }]
            // }).
            
        /// Page - Specific States

            state('privacy', {
                url: '/privacy',
                templateUrl: '/modules/core/views/templates/privacy.template.html',
                parent: 'fixed-opaque'
            }).
            

            state('tos', {
                url: '/tos',
                templateUrl: '/modules/core/views/templates/tos.template.html',
                parent: 'fixed-opaque'
            });
    }
    
    handleBadRoute.$inject = ['$injector', '$location'];
    function handleBadRoute($injector, $location) {
        console.log('Unknown URL pattern: %s', $location.url());
        
        var settings = {
            isProduction: ApplicationConfiguration.isProduction,
            defaultRedirect: ApplicationConfiguration.defaultRedirect
        };
        
        if (settings.defaultRedirect === null) {
            return;
        }
        
        debugger;
        if (!!settings && !!settings.defaultRedirect) {
            if (/^http/i.test(settings.defaultRedirect)) {
                window.location.href = settings.defaultRedirect;
                return;
            }
            $location.path(settings.defaultRedirect);
            return;
        }
        
        if (!!settings && settings.isProduction) {
            window.location.href = 'http://www.truckerline.com';
        } else {
            $location.path('/trucker');
        }
    }

    resolveUser.$inject = ['Authentication', 'LoginService'];
    function resolveUser(Authentication, LoginService) {
        return LoginService.getUser().then(
            function success(user) {

                if (!Authentication.user) {
                    Authentication.user = user;
                }

                return user;
            },
            function reject(reason) {
                console.error('Unable to load user - not logged in?', reason);

                return null;
            });
    }
})();
