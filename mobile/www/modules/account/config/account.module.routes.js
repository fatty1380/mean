(function () {
    'use strict';

    angular
        .module('account')
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('account', {
                    url: '/account',
                    abstract: true,
                    templateUrl: 'modules/account/templates/account.html'
                })
                .state('account.profile', {
                    url: '/profile',
                    views:{
                        'profile':{
                            templateUrl: 'modules/account/child_modules/profile/templates/profile.html',
                            controller: 'ProfileCtrl'
                        }
                    }
                })
                .state('account.lockbox', {
                    url: '/lockbox',
                    views:{
                        'lockbox':{
                            templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox.html'
                        }
                    }
                })
                .state('account.activity', {
                    url: '/activity',
                    views:{
                        'activity':{
                            templateUrl: 'modules/account/child_modules/activity/templates/activity.html'
                        }
                    }
                })
                .state('account.messages', {
                    url: '/messages',
                    views:{
                        'messages':{
                            templateUrl: 'modules/account/child_modules/messages/templates/messages.html'
                        }
                    }
                })
        }])

})();
