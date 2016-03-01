(function () {
    'use strict';

    angular
        .module('account')
        .config(accountModuleRouting);

    accountModuleRouting.$inject = ['$stateProvider'];

    function accountModuleRouting ($stateProvider) {

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
                    profile: function () { return null; }
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
                    profile: ['$stateParams', 'registerService', 'user', 'userService', 'appCache',
                        function resolveUserProfile ($stateParams, registerService, user, userService, appCache) {
                            var id = $stateParams.userId;
                            if (!!id && id != user.id) {

                                var cachedProfile = appCache.getProfile(id);
                                if (!!cachedProfile && cachedProfile.id === id) return cachedProfile;

                                return registerService.getProfileById(id)
                                    .then(function success (response) {
                                        if (response.success) {
                                            return response.message.data;
                                        }
                                        return null;
                                    })
                                    .then(function (profile) {
                                        if (!_.isEmpty(profile)) {
                                            userService.getAvatar(profile);
                                            appCache.cacheProfile(profile);
                                        }

                                        return profile;
                                    })
                                    .catch(function reject (error) {
                                        return null;
                                    });
                            }

                            return null;
                        }],
                    welcome: ['welcomeService', function (welcomeService) {
                        welcomeService.showModal('account.profile');
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
                            documents: ['lockboxDocuments', 'user', 'LoadingService',
                                function (lockboxDocuments, user, LoadingService) {

                                    LoadingService.showLoader('Loading documents');

                                    return lockboxDocuments.getFilesByUserId(user.id)
                                        .then(function (data) {
                                            logger.debug('returning lockbox doc loaded from device');
                                            return lockboxDocuments.getDocuments(true);
                                        })
                                        .catch(function (err) {
                                            logger.error('[LockboxDocResolve] Couldn\'t retrieve documents err --->>>', err);

                                            if (/no access/i.test(err)) {
                                                return -1;
                                            }

                                            return lockboxDocuments.getDocuments(true)
                                                .catch(function (err) {
                                                    logger.error('Caught error on secondary Lockbox doc access attempt', err);
                                                    return -1;
                                                });
                                        });
                                }],
                            welcome: ['welcomeService', function (welcomeService) {
                                return welcomeService.showModal('account.lockbox');
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

                        logger.debug('Looking up chat for recipient ID `%s`', $stateParams.recipientId);
                        return messageService.getChatByUserId($stateParams.recipientId);
                    }],
                    welcome: ['welcomeService', function (welcomeService) {
                        return welcomeService.showModal('account.messages');
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
                    }],
                    welcome: ['welcomeService', function (welcomeService) {
                        welcomeService.showModal('account.activity');
                    }]
                }
            });
    }

})();
