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
                    views:{
                        '@':{
                            templateUrl: 'modules/account/child_modules/profile/templates/profile-share.html'
                        }
                    }
                })
                .state('account.profile.share.content', {
                    url: '/content',
                    views:{
                        '@':{
                            templateUrl: 'modules/account/child_modules/profile/templates/profile-share-contents.html',
                            controller: 'ProfileShareCtrl as vm'
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
                    views:{
                        '@':{
                            templateUrl: 'modules/account/child_modules/profile/templates/profile-edit.html'
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
                .state('account.lockbox.share', {
                    url: '/share',
                    views:{
                        '@':{
                            templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox-share.html',
                            controller: 'LockboxShareCtrl as vm'
                        }
                    }
                })
                .state('account.lockbox.edit', {
                    url: '/edit',
                    views:{
                        '@':{
                            templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox-edit.html',
                            controller: 'LockboxEditCtrl as vm'
                        }
                    }
                })
                .state('account.lockbox.recipient', {
                    url: '/share/recipient',
                    views:{
                        '@':{
                            templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox-share-recipient.html'
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
                            templateUrl: 'modules/account/child_modules/messages/templates/messages.html',
                            controller: 'messagesCtrl as vm'
                        }
                    }
                })
        }])

})();
