(function () {
    'use strict';

    accountModuleRouting.$inject = ['$stateProvider'];

    angular
        .module('account')
        .config(accountModuleRouting)

    function accountModuleRouting($stateProvider) {

        $stateProvider

            .state('account', {
                url: '/account',
                abstract: true,
                templateUrl: 'modules/account/templates/account.html'
            })

            .state('account.profile', {
                url: '/profile',
                views: {
                    'profile': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile.html',
                        controller: 'ProfileCtrl as vm',
                        resolve: {
                            profileData: getProfileData
                        }
                    }
                }
            })

            .state('account.profile.share', {
                url: '/share',
                views: {
                    '@': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile-share.html',
                        controller: 'ProfileShareCtrl as vm',
                        resolve: {
                            profileData: getProfileData
                        }
                    }
                }
            })

            .state('account.profile.friends', {
                url: '/friends',
                views: {
                    '@': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile-friends.html',
                        controller: 'FriendsCtrl as vm'
                    }
                }
            })

            .state('account.lockbox', {
                url: '/lockbox',
                views: {
                    'lockbox': {
                        templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox.html',
                        controller: 'lockboxCtrl as vm'
                    }
                }
            })

            .state('account.messages', {
                url: '/messages',
                views: {
                    'messages': {
                        templateUrl: 'modules/account/child_modules/messages/templates/messages.html',
                        controller: 'messagesCtrl as vm'
                    }
                }
            })

            .state('account.activity', {
                url: '/activity',
                views: {
                    'activity': {
                        templateUrl: 'modules/account/child_modules/activity/templates/activity.html',
                        controller: 'ActivityCtrl as vm'
                    }
                }
            })
    }

    function getProfileData(registerService) {
        return registerService
            .me()
            .then(function (response) {
                if (response.success) {
                    return response.message.data;
                }
            });
    };

})();
