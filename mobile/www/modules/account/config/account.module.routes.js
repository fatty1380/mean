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
                    views: {
                        'profile': {
                            templateUrl: 'modules/account/child_modules/profile/templates/profile.html',
                            controller: 'ProfileCtrl as vm'
                        }
                    }
                })
                .state('account.profile.share', {
                    url: '/share',
                    views: {
                        '@': {
                            templateUrl: 'modules/account/child_modules/profile/templates/share-profile.html'
                        }
                    }
                })
                .state('account.profile.request', {
                    url: '/request',
                    views: {
                        '@': {
                            templateUrl: 'modules/account/child_modules/profile/templates/request-review.html'
                        }
                    }
                })
                .state('account.profile.edit', {
                    url: '/edit',
                    views: {
                        '@': {
                            templateUrl: 'modules/account/child_modules/profile/templates/edit-profile.html'
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
                .state('account.activity', {
                    url: '/activity',
                    views: {
                        'activity': {
                            templateUrl: 'modules/account/child_modules/activity/templates/activity.html'
                        }
                    }
                })
                .state('account.messages', {
                    url: '/messages',
                    views: {
                        'messages': {
                            templateUrl: 'modules/account/child_modules/messages/templates/messages.html'
                        }
                    }
                })
        }])

})();
