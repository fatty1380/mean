
(function () {
    'use strict';

    angular
        .module('signup', [ 'signup.register','signup.engagement','signup.license','signup.trailers','signup.trucks'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('signup/signin', {
                    url: '/signin/signin',
                    templateUrl: 'modules/signup/signin/signin.html',
                    controller: 'signinCtrl'
                })

                .state('signup/register', {
                    url: '/signup/register',
                    templateUrl: 'modules/signup/register/register.html',
                    controller: 'registerCtrl'
                })

                .state('signup/engagement', {
                    url: '/signup/engagement',
                    templateUrl: 'modules/signup/engagement/engagement.html',
                    controller: 'engagementCtrl'
                })

                .state('signup/license', {
                    url: '/signup/license',
                    templateUrl: 'modules/signup/license/license.html',
                    controller: 'licenseCtrl'
                })

                .state('signup/trucks', {
                    url: '/signup/trucks',
                    templateUrl: 'modules/signup/trucks/trucks.html',
                    controller: 'trucksCtrl'
                })

                .state('signup/trailers', {
                    url: '/signup/trailers',
                    templateUrl: 'modules/signup/trailers/trailers.html',
                    controller: 'trailersCtrl'
                })
        }])
})();
