(function () {
    'use strict';

    angular
        .module('signup',

        [ 'signup.signin', 'signup.register','signup.engagement','signup.license','signup.trailers','signup.trucks', 'directives'])

        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('signup/signin', {
                    url: '/signup/signin',
                    templateUrl: 'modules/signup/templates/signin.html',
                    controller: 'signinCtrl',
                    controllerAs: 'vm'
                })

                .state('signup/register', {
                    url: '/signup/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'registerCtrl'
                })

                .state('signup/engagement', {
                    url: '/signup/engagement',
                    templateUrl: 'modules/signup/templates/engagement.html',
                    controller: 'engagementCtrl'
                })

                .state('signup/license', {
                    url: '/signup/license',
                    templateUrl: 'modules/signup/templates/license.html',
                    controller: 'licenseCtrl'
                })

                .state('signup/trucks', {
                    url: '/signup/trucks',
                    templateUrl: 'modules/signup/templates/trucks.html',
                    controller: 'trucksCtrl'
                })

                .state('signup/trailers', {
                    url: '/signup/trailers',
                    templateUrl: 'modules/signup/templates/trailers.html',
                    controller: 'trailersCtrl'
                })
        }])
})();
