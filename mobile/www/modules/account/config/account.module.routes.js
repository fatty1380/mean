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
                cache: false,
                templateUrl: 'modules/account/templates/account.html',
                controller: 'AccountCtrl as vm',
                resolve: {
                    user: ['userService', function (userService) {
                        return userService.getUserData();
                    }],
                    updates: ['updateService', function (updateService) {
                        return updateService.getLastUpdates();
                    }],
                    profile: function () { return null }
                }
            })

            .state('account.profile', {
                url: '/profile/:userId',
                cache: false,
                views: {
                    'profile': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile.html',
                        controller: 'ProfileCtrl as vm',
                        resolve: {
                            updates: ['updateService', function (updateService) {
                                return updateService.getLastUpdates();
                            }]
                        }
                    }
                },
                resolve: {
                    profile: ['$stateParams', 'registerService', 'appCache',
                        function resolveUserProfile($stateParams, registerService, appCache) {
                            var id = $stateParams.userId;
                            if (!!id) {

                                var cachedProfile = appCache.getProfile(id);
                                if(!!cachedProfile && cachedProfile.id === id) return cachedProfile;

                                return registerService.getProfileById(id)
                                    .then(function success(response) {
                                        if (response.success) {
                                            appCache.cacheProfile(response.message.data);
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

                            return null;
                        }],
                    welcome: ['welcomeService', 'profileModalsService',
                        function (welcomeService, profileModalsService) {
                            if (welcomeService.welcomeUser) {
                                profileModalsService
                                    .showWelcomeModal()
                                    .then(function () {
                                        welcomeService.welcomeUser = false;
                                    });
                            }
                        }]
                }
            })

            .state('account.profile.friends', {
                url: '/friends',
                views: {
                    '@': {
                        templateUrl: 'modules/account/child_modules/profile/templates/profile-friends.html',
                        controller: 'FriendsCtrl as vm',
                        resolve: {
                            friends: ['$stateParams', 'friendsService', function ($stateParams, friendsService) {
                                return friendsService.loadFriends($stateParams.userId)
                                    .then(function (response) {
                                        return response;
                                    });
                            }],
                            updates: ['updateService', function (updateService) {
                                return updateService.getLastUpdates();
                            }]
                        }
                    }
                }
            })

            .state('account.lockbox', {
                url: '/lockbox',
                views: {
                    'lockbox': {
                        templateUrl: 'modules/account/child_modules/lockbox/templates/lockbox.html',
                        controller: 'LockboxCtrl as vm',
                        resolve: {
                            documents: ['lockboxDocuments', 'user', function (lockboxDocuments, user) {
                                return lockboxDocuments.getFilesByUserId(user.id).then(function (data) {
                                    return data;
                                });
                            }]
                        }
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
                },
                resolve: {
                    user: ['userService', function (userService) {
                        return userService.getUserData();
                    }]
                }
            })
    }

})();
