(function () {
    'use strict';

    angular
        .module('signup')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider

                .state('home', {
                    url: '/home',
                    templateUrl: 'modules/signup/templates/home.html',
                    controller: 'HomeCtrl as vm',
                    resolve: {
                        /**
                         * @desc check user logged in
                        */
                        check: ['$q', 'userService', '$state', 'tokenService', 'registerService',
                            function ($q, userService, $state, tokenService, registerService) {
                                var defer = $q.defer();
                                if (tokenService.get('access_token')) {
                                    registerService.me()
                                        .then(function (response) {
                                            if (response && response.success) {
                                                defer.resolve();
                                                if (response.message.data) {
                                                    $state.go('account.profile');
                                                }
                                            } else {
                                                if (response && response.status == 401) {
                                                    tokenService.set('access_token', '');
                                                }
                                                defer.resolve();
                                            }
                                        });
                                } else {
                                    defer.resolve();
                                }
                                return defer.promise;
                            }
                        ]
                    }
                })

                .state('login', {
                    url: '/login',
                    templateUrl: 'modules/signup/templates/login.html',
                    controller: 'LoginCtrl as vm'
                })

                .state('signup-register', {
                    url: '/signup/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'RegisterCtrl as vm'
                })

                .state('signup-engagement', {
                    url: '/signup/engagement',
                    templateUrl: 'modules/signup/templates/engagement.html',
                    controller: 'EngagementCtrl as vm'
                })

                .state('signup-license', {
                    url: '/signup/license',
                    templateUrl: 'modules/signup/templates/license.html',
                    controller: 'LicenseCtrl as vm'
                })

                .state('signup-trucks', {
                    url: '/signup/trucks',
                    templateUrl: 'modules/signup/templates/trucks.html',
                    controller: 'TrucksCtrl as vm'
                })

                .state('signup-trailers', {
                    url: '/signup/trailers',
                    templateUrl: 'modules/signup/templates/trailers.html',
                    controller: 'TrailersCtrl as vm'
                })

                .state('signup-friends', {
                    url: '/signup/friends',
                    templateUrl: 'modules/signup/templates/friends.html',
                    controller: 'SignupFriendsCtrl as vm'
                })

                .state('signup-friends-contacts', {
                    url: '/signup/contacts',
                    templateUrl: 'modules/signup/templates/add-friends-from-contacts.html',
                    controller: 'AddContactFriendsCtrl as vm',
                    params: {
                        resolveContacts: false
                    },
                    resolve: {
                        contacts: function ($stateParams, contactsService, $ionicLoading) {
                            var resolveContacts = $stateParams.resolveContacts;
                            if (resolveContacts) {
                                var contacts = contactsService.getContacts();
                                if (!contacts.length) {
                                    $ionicLoading.show({ template: 'Loading Contacts....' });
                                    return contactsService.retrieveContacts();
                                }
                            }
                        }
                    }
                })

                .state('signup-friends-manually', {
                    url: '/signup/manually',
                    templateUrl: 'modules/signup/templates/add-friend-manually.html',
                    controller: 'AddFriendManuallyCtrl as vm'
                })

        }]);
})();
