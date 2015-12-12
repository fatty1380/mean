(function () {
    'use strict';

    angular
        .module('signup')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider

                .state('home', {
                    url: '/home',
                    cache: false,
                    templateUrl: 'modules/signup/templates/home.html',
                    controller: 'HomeCtrl as vm',
                    resolve: {
                        loginCheck: loginCheckAndRedirect
                    }
                })

                .state('login', {
                    url: '/login',
                    templateUrl: 'modules/signup/templates/login.html',
                    controller: 'LoginCtrl as vm'
                })

                .state('signup', {
                    url: '/signup',
                    templateUrl: 'modules/signup/templates/signup-base.html',
                    abstract: true
                })

                .state('signup.register', {
                    url: '/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'RegisterCtrl as vm'
                })

                .state('signup.license', {
                    url: '/license',
                    templateUrl: 'modules/signup/templates/license.html',
                    controller: 'LicenseCtrl as vm'
                })

                .state('signup.engagement', {
                    url: '/engagement',
                    templateUrl: 'modules/signup/templates/engagement.html',
                    controller: 'EngagementCtrl as vm'
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

                .state('signup.friends-contacts', {
                    url: '/contacts',
                    templateUrl: 'modules/signup/templates/add-friends-from-contacts.html',
                    controller: 'AddContactFriendsCtrl as vm',
                    params: {
                        resolveContacts: false
                    },
                    resolve: {
                        contacts: function ($stateParams, contactsService, LoadingService) {
                            return contactsService.loadOrResolveContacts($stateParams.resolveContacts);
                        }
                    }
                })

                .state('signup.friends-manually', {
                    url: '/manually',
                    templateUrl: 'modules/signup/templates/add-friend-manually.html',
                    controller: 'AddFriendManuallyCtrl as vm'
                })

        }]);


    /**
     * @desc check user logged in
    */
    loginCheckAndRedirect.$inject = ['$q', 'userService', '$state', 'tokenService', 'registerService', 'securityService'];
    function loginCheckAndRedirect($q, userService, $state, tokenService, registerService, securityService) {
        if (tokenService.get('access_token')) {
            return registerService.me()
                .then(function (response) {
                    if (response && response.success) {
                        if (response.message.data) {
                            securityService.initialize();
                            $state.go('account.profile');
                            return true;
                        }
                    } else {
                        if (response && response.status == 401) {
                            tokenService.set('access_token', '');
                        }
                    }
                    return false;
                })
                .catch(function (err) {
                    logger.error('Failed to load `me`', err);
                    return false;
                });
        } else {
            return $q.when(false);
        }
    }
})();
