(function () {
    'use strict';

    angular
        .module('account')
        .config(accountModuleRouting);

    accountModuleRouting.$inject = ['$stateProvider'];

    function accountModuleRouting($stateProvider) {

        $stateProvider

            .state('account', {
                url: '/account',
                abstract: true,
                templateUrl: 'modules/account/templates/account.html',
                resolve: {
                    user: function resolveLoggedInUser(userService) {
                        return userService.getUserData();
                    },
                    profile: function () { return null }
                }
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

            .state('account.profile.user', {
                url: '/:userId',
                views: {
                    'profile@account': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile.html',
                        controller: 'ProfileCtrl as vm'
                    }
                },
                resolve: {
                    profile: function resolveUserProfile($stateParams, registerService, userService) {
                        
                        if (!!$stateParams.userId) {
                            return registerService.getProfileById($stateParams.userId)
                                .then(function success(response) {
                                    if (response.success) {
                                        return response.message.data;
                                    }
                                    debugger;
                                    return null;
                                })
                                .catch(function reject(error) {
                                    debugger;
                                    return null;
                                });
                        }

                        return userService.getUserData();
                    }
                }
            })

            .state('account.profile.friends', {
                url: '/friends',
                views: {
                    '@': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile-friends.html',
                        controller: 'FriendsCtrl as vm',
                        resolve: {
                            friends: function (friendsService) {
                                return friendsService
                                    .retrieveFriends()
                                    .then(function (response) {
                                        friendsService.setFriends(response.data);
                                       return response.data;
                                    });
                            }
                        }
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
                params: {
                    recipientId: {
                        default: null
                    }
                },
                views: {
                    'messages': {
                        templateUrl: 'modules/account/child_modules/messages/templates/messages.html',
                        controller: 'MessagesCtrl as vm'
                    }
                },
                resolve: {
                    recipientChat: ['$stateParams', 'messageService', function ($stateParams, messageService) {
                        if (typeof $stateParams.recipientId !== 'string' || !$stateParams.recipientId) {
                            return null;
                        }
                        
                        console.log('Looking up chat for recipient ID `%s`', $stateParams.recipientId)
                        return messageService.getChatByUserId($stateParams.recipientId);
                    }]
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
