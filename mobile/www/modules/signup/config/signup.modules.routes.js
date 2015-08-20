(function () {
    'use strict';

    angular
        .module('signup')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider

                .state('signup/home', {
                    url: '/signup/home',
                    templateUrl: 'modules/signup/templates/home.html',
                    controller: 'HomeCtrl as vm'
                })

                .state('signup/login', {
                    url: '/signup/login',
                    templateUrl: 'modules/signup/templates/login.html',
                    controller: 'LoginCtrl as vm'
                })

                .state('signup/register', {
                    url: '/signup/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'RegisterCtrl as vm'
                })

                .state('signup/engagement', {
                    url: '/signup/engagement',
                    templateUrl: 'modules/signup/templates/engagement.html',
                    controller: 'EngagementCtrl as vm'
                })

                .state('signup/license', {
                    url: '/signup/license',
                    templateUrl: 'modules/signup/templates/license.html',
                    controller: 'LicenseCtrl as vm'
                })

                .state('signup/trucks', {
                    url: '/signup/trucks',
                    templateUrl: 'modules/signup/templates/trucks.html',
                    controller: 'TrucksCtrl as vm'
                })

                .state('signup/trailers', {
                    url: '/signup/trailers',
                    templateUrl: 'modules/signup/templates/trailers.html',
                    controller: 'TrailersCtrl as vm'
                })
        }])
})();
