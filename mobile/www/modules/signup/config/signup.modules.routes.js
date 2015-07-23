(function () {
    'use strict';

    angular
        .module('signup')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('signup/signin', {
                    url: '/signup/signin',
                    templateUrl: 'modules/signup/templates/signin.html',
                    controller: 'signinCtrl as vm'
                })

                .state('signup/register', {
                    url: '/signup/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'registerCtrl as vm'
                })

                .state('signup/engagement', {
                    url: '/signup/engagement',
                    templateUrl: 'modules/signup/templates/engagement.html',
                    controller: 'engagementCtrl as vm'
                })

                .state('signup/license', {
                    url: '/signup/license',
                    templateUrl: 'modules/signup/templates/license.html',
                    controller: 'licenseCtrl as vm'
                })

                .state('signup/trucks', {
                    url: '/signup/trucks',
                    templateUrl: 'modules/signup/templates/trucks.html',
                    controller: 'trucksCtrl as vm'
                })

                .state('signup/trailers', {
                    url: '/signup/trailers',
                    templateUrl: 'modules/signup/templates/trailers.html',
                    controller: 'trailersCtrl as vm'
                })
        }])
})();
