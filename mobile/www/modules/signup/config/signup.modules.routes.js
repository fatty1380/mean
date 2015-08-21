(function () {
    'use strict';

    angular
        .module('signup')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider

                .state('signup', {
                    url: '/signup',
                    abstract: true,
                    template: '<ion-nav-view></ion-nav-view>'
                })

                .state('signup.home', {
                    url: '/home',
                    templateUrl: 'modules/signup/templates/home.html',
                    controller: 'HomeCtrl as vm'
                })

                .state('signup.signin', {
                    url: '/signin',
                    templateUrl: 'modules/signup/templates/signin.html',
                    controller: 'signinCtrl as vm'
                })

                .state('signup.login', {
                    url: '/login',
                    templateUrl: 'modules/signup/templates/login.html',
                    controller: 'LoginCtrl as vm'
                })

                .state('signup.register', {
                    url: '/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'RegisterCtrl as vm'
                })

                .state('signup.engagement', {
                    url: '/engagement',
                    templateUrl: 'modules/signup/templates/engagement.html',
                    controller: 'EngagementCtrl as vm'
                })

                .state('signup.license', {
                    url: '/license',
                    templateUrl: 'modules/signup/templates/license.html',
                    controller: 'LicenseCtrl as vm'
                })

                .state('signup.trucks', {
                    url: '/trucks',
                    templateUrl: 'modules/signup/templates/trucks.html',
                    controller: 'TrucksCtrl as vm'
                })

                .state('signup.trailers', {
                    url: '/trailers',
                    templateUrl: 'modules/signup/templates/trailers.html',
                    controller: 'TrailersCtrl as vm'
                })

                .state('signup.friends', {
                    url: '/friends',
                    templateUrl: 'modules/signup/templates/friends.html',
                    controller: 'SignupFriendsCtrl as vm'
                })

                .state('signup.contacts', {
                    url: '/contacts',
                    templateUrl: 'modules/signup/templates/add-friends-from-contacts.html',
                    controller: 'AddContactFriendsCtrl as vm'
                })

                .state('signup.manually', {
                    url: '/manually',
                    templateUrl: 'modules/signup/templates/add-friend-manually.html',
                    controller: 'AddFriendManuallyCtrl as vm'
                })

                .state('signup.welcome', {
                    url: '/welcome',
                    templateUrl: 'modules/signup/templates/welcome.html',
                    controller: 'WelcomeCtrl as vm'
                })
        }])
})();
