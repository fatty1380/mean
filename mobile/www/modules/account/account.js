(function () {
    'use strict';

    angular
        .module('account', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('account', {
                    url: '/account',
                    abstract: true,
                    templateUrl: 'modules/account/account.html'
                })
                .state('account.profile', {
                    url: '/profile',
                    views:{
                        'profile':{
                            templateUrl: 'modules/account/profile/profile.html'
                        }
                    }
                })
                .state('account.lockbox', {
                    url: '/lockbox',
                    views:{
                        'lockbox':{
                            templateUrl: 'modules/account/lockbox/lockbox.html'
                        }
                    }
                })
                .state('account.activity', {
                    url: '/activity',
                    views:{
                        'activity':{
                            templateUrl: 'modules/account/activity/activity.html'
                        }
                    }
                })
                .state('account.messages', {
                    url: '/messages',
                    views:{
                        'messages':{
                            templateUrl: 'modules/account/messages/messages.html'
                        }
                    }
                })
        }])
})();