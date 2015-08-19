(function () {
    'use strict';

    angular
        .module('account')
        .config(accountModuleRouting)

    accountModuleRouting.$inject = ['$stateProvider'];

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
                            controller: 'ProfileCtrl as vm'
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

                .state('account.profile.friends.manual', {
                    url: '/manual',
                    views: {
                        '@': {
                            templateUrl: 'modules/account/child_modules/profile/templates/profile-friends-manual-add.html',
                            controller: 'ManualFriendsAddCtrl as vm'
                        }
                    }
                })

                .state('account.lockbox', {
                    url: '/lockbox',
                    views: {
                        'lockbox': {
                            templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox.html',
                            controller: 'LockboxCtrl as vm'
                        }
                    }
                })

                .state('account.messages', {
                    url: '/messages',
                    views: {
                        'messages': {
                            templateUrl: 'modules/account/child_modules/messages/templates/messages.html',
                            controller: 'MessagesCtrl as vm'
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

})();
