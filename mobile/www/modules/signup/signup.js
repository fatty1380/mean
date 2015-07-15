
(function () {
    'use strict';

    angular
        .module('signup', [ 'signupCore','signupEngagement','signupLicense','signupTrailer','signupTruck'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('signup/signin', {
                    url: '/signin/signin',
                    templateUrl: 'modules/signup/signin/signin.html',
                    controller: 'signinCtrl'
                })

                .state('signup/', {
                    url: '/signup',
                    templateUrl: 'modules/signup/signupCore/signupCore.html',
                    controller: 'signupCtrl'
                })

                .state('signup/engagement', {
                    url: '/signup/engagement',
                    templateUrl: 'modules/signup/signupEngagement/signupEngagement.html',
                    controller: 'signupEngagementCtrl'
                })

                .state('signup/license', {
                    url: '/signup/license',
                    templateUrl: 'modules/signup/signupLicense/signupLicense.html',
                    controller: 'signupLicenseCtrl'
                })

                .state('signup/truck', {
                    url: '/signup/truck',
                    templateUrl: 'modules/signup/signupTruck/signupTruck.html',
                    controller: 'signupTruckCtrl'
                })

                .state('signup/trailer', {
                    url: '/signup/trailer',
                    templateUrl: 'modules/signup/signupTrailer/signupTrailer.html',
                    controller: 'signupTrailerCtrl'
                })
        }])
})();
