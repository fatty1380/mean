(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$rootScope', '$scope', 'StorageService', 'updateService', 'appCache', '$state', '$cordovaGoogleAnalytics',
        'activityService', 'reviewService', 'LoadingService', 'experienceService', 'utilsService',
        'friendsService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($rootScope, $scope, StorageService, updateService, appCache, $state, $cordovaGoogleAnalytics,
        activityService, reviewService, LoadingService, experienceService, utilsService,
        friendsService, avatarService, profileModalsService, cameraService, user, profile) {

        var vm = this;

        logger.debug('Loading $state: `%s`', $state.current.name);

        vm.profileData = profile || user;
        //vm.profileAvatar = 
        vm.user = user;
        vm.camera = cameraService;
        vm.updates = updateService.getLastUpdates();
        
        // vm.reviews = [];
        // [{ rating: 5, title: 'A real professional driver!', created: 1443285630631, text: 'Sergey is incredibly professional, and in the 5 years he has been delivering freight to my job sites, he has never let me down', name: 'Rob' }, { rating: 4, text: 'Serge is a good driver, has never let me down', title: 'He is the best', name: 'John', created: 1443285630631 }];

        vm.canEdit = vm.profileData && vm.user ? vm.profileData.id === vm.user.id : false;

        vm.showEndorsements = showEndorsements;
        vm.showFriends = showFriends;
        vm.openChat = openChat;
        vm.friendStatus = null;

        vm.ab = function () {
            var profi = appCache.getCachedProfiles();
            logger.info(' Loaded Cached Profiles --->>>', profi);
        };

        var unbindUpdatesHandler = null;
        function destroy() {
            _.isFunction(unbindUpdatesHandler) && unbindUpdatesHandler();
        }

        $rootScope.$on("clear", function () {
            logger.debug('ProfileCtrl my event occurred');
            vm.profileData = profile || user;
            vm.user = user;
            vm.friendStatus = null;

            destroy();
        });

        $scope.$on('$ionicView.enter', function (event) {
            if (_.isEmpty(unbindUpdatesHandler)) {
                unbindUpdatesHandler = $rootScope.$on('updates-available', function (event, updates) {
                    logger.debug('ProfileCtrl: %d New updates available: ', updates);
                    vm.updates = updates;
                });
            }

            getReviews();
        });

        $scope.$on('$ioncView.unloaded', function (event) {
            destroy();
        });
        
        //
        
        vm.welcomeExperience = JSON.parse(StorageService.get('welcome.experience')) || !_.isEmpty(vm.user.experience);
        vm.welcomeReview = true;
        
        //////////////////////////////////////////////////////////////////////////////////////////////

        function showFriends() {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showFriends');
            logger.debug('TODO: Edit friends to adhere to \'profile\' resolve parameter');
            $state.go('account.profile.friends', { userId: profile && profile.id });
        }

        function showEndorsements() {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showEndorsements');
            if (_.isEmpty(vm.profileData.license) ||
                _.isEmpty(vm.profileData.license.class) && _.isEmpty(vm.profileData.license.endorsements)) {
                return;
            }

            var title = !!vm.profileData.license.class ? '<h3>Class ' + vm.profileData.license.class + '</h3>' : '<h3>License</h3>';

            var listItems = _.map(vm.profileData.license.endorsements,
                function (e) {
                    return '<li>' + vm.endorsementsMap[e].title + '</li>';
                })

            var endorsements = '<ul>' + listItems.join('') + '</ul>';

            LoadingService.show(title + endorsements, { noBackdrop: true });
        }

        if (!vm.canEdit) {

            vm.feed = [];
            vm.experience = vm.profileData.experience || [];
            vm.isFriend = vm.profileData.friends.indexOf(vm.user.id) >= 0;
            vm.feedMessage = vm.isFriend ? 'No feed items' : 'You have to be friends to see user\'s feed';

            if (!vm.isFriend) {
                vm.profileData.displayName = vm.profileData.firstName + ' ' + (vm.profileData.lastName && vm.profileData.lastName[0]);
            } else {
                LoadingService.showLoader('Loading ' + vm.profileData.firstName + '\'s Feed');

                activityService
                    .getFeed().then(function (result) {
                        var uniqueResults = _.uniq(result),
                            sortedItems = [];

                        for (var i = 0; i < uniqueResults.length; i++) {
                            var item = uniqueResults[i],
                                userID = item.user && item.user.id;

                            if (userID === vm.profileData.id) {
                                sortedItems.push(item);
                            }
                        }

                        vm.feed = sortedItems;
                        LoadingService.hide();
                    }, function (err) {
                        LoadingService.hide();
                    });
            }

            friendsService
                .getFriendStatus(vm.profileData.id)
                .then(function (response) {
                    vm.friendStatus = response.data.status;
                    vm.friendRequest = response.data.request;
                });


            vm.addUserToFriends = function () {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'addUserToFriends');
                var friend = vm.profileData;

                if (!friend) return;

                var requestData = {
                    to: friend.id,
                    text: 'Hi there! I want to add you to my friend list!'
                };

                friendsService
                    .createRequest(requestData)
                    .then(function (createdRequestResp) {
                        if (createdRequestResp.status === 200) {
                            vm.friendStatus = 'sent';
                            var template = 'You have invited ' + friend.firstName + ' to be friends.';
                            LoadingService.showSuccess(template);

                        }
                    });
            };

            vm.doFriendAction = function doFriendAction(parameters) {
                switch (vm.friendStatus) {
                    case 'none':
                        vm.addUserToFriends();
                        break;
                    case 'pending':
                        vm.acceptFriend();
                        break;
                    case 'friends':
                        logger.debug('The convoy is strong with ' + vm.profileData.displayName);
                        break;
                    case 'sent':
                        logger.debug('Already sent the invitation to ' + vm.profileData.displayName);
                        break;
                }
            };

            vm.acceptFriend = function acceptFriend() {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'acceptFriend');
                friendsService
                    .updateRequest(vm.friendRequest.id, { action: 'accept' })
                    .then(function (result) {
                        if (result.status === 200) {
                            vm.friendStatus = 'friends';
                            user.friends.push(vm.friendRequest.from);
                            var template = 'Added ' + (vm.profileData.handle || vm.profileData.firstName) + ' to your convoy';
                            LoadingService.showSuccess(template);
                        }
                    })
            }
        }

        if (vm.canEdit) { // TODO: Restore this || vm.profileData.id === vm.user.id) {

            /**
             * showUserSettings
             * ----------------
             * Placeholder for showing app settings
             */
            vm.showUserSettings = null;
            getExperience();

            /**
             * showEditAvatar
             * --------------
             * Opens an action sheet which leads to either taking
             * a photo, or selecting from device photos.
             */
            vm.showEditAvatar = function (parameters) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'editAvatar');
                avatarService.getNewAvatar(parameters, vm.profileData);
            };

            /**
             * showEditModal
             * -------------
             * Shows the "Edit User" modal screen to allow
             * editing of user's name, properties, etc
             */
            vm.showEditModal = function (parameters) {
            				$cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'showEdit');
                
                profileModalsService
                    .showProfileEditModal(parameters)
                    .then(function (result) {
                        if (!!result) {
																									vm.profileData = result;}
                    });
            };

            vm.showShareModal = function (parameters) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'showShare');
                
                profileModalsService
                    .showProfileShareModal(parameters)
                    .then(function (result) {
                        logger.debug(result);
                    },
                        function (err) {
                            logger.debug(err);
                        })
            };

            vm.showRequestReviewModal = function (parameters) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'showRequestReview');
                
                profileModalsService
                    .showRequestReviewModal(parameters)
                    .then(function (result) {
                        logger.debug(result);
                    },
                        function (err) {
                            logger.debug(err);
                        })
            };

            vm.showAddExperienceModal = function (parameters) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'addExperience');
                profileModalsService
                    .showAddExperienceModal(parameters)
                    .then(function (experienceResult) {
                        if (_.isEmpty(experienceResult)) {
                            return;
                        }

                        if (_.isArray(experienceResult)) {
                            vm.experience = experienceResult;
                        } else {
                            vm.experience.push(experienceResult);
                        }
                    })
                    .catch(function (err) {
                        if (!!err) { logger.debug(err); }
                    })
            };

            vm.showEditExperienceModal = function (experienceItem) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'editExperience');
                profileModalsService
                    .showEditExperienceModal(experienceItem)
                    .then(function (experienceResult) {
                        logger.debug('Edited Experience ', experienceResult);

                        if (_.isArray(experienceResult)) {
                            vm.experience = experienceResult;
                        } else {
                            vm.experience.push(experienceResult);
                        }
                        
                        //experienceItem = result;
                        getExperience();
                    })
                    .catch(function (err) {
                        if (!!err) { logger.debug(err); }
                    })
            };
        }
        // END: vm.canEdit
        
        vm.showProfileTab = function () {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showReviews');
            $cordovaGoogleAnalytics.trackView(vm.canEdit ? 'account.profile' : 'user.profile');
        }

        vm.showReviewTab = function () {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showReviews');
            $cordovaGoogleAnalytics.trackView((vm.canEdit ? 'account.profile' : 'user.profile') + '.reviews');
            if (vm.canEdit) {
                updateService.resetUpdates('reviews');

                if (!vm.welcomeReview) {
                    vm.welcomeReview = 'true';
                    StorageService.set('welcome.review', 'true');
                }
            }
        }

        vm.showExperienceTab = function () {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showExperience');
            $cordovaGoogleAnalytics.trackView((vm.canEdit ? 'account.profile' : 'user.profile') + '.experience');
            if (vm.canEdit && !vm.welcomeExperience) {
                vm.welcomeExperience = 'true';
                StorageService.set('welcome.experience', 'true');
            }
        }

        vm.getReviewBadge = function () {
            if (vm.canEdit) {

                if (!!vm.updates.reviews) {
                    return vm.updates.reviews;
                }

                if (!vm.welcomeReview) {
                    return '+'
                }
            }

            return null;
        }

        vm.getExperienceBadge = function () {
            if (vm.canEdit && !vm.welcomeExperience) {
                return '+';
            }

            return null;
        }

        function getReviews() {
            reviewService
                .getReviewsByUserID(vm.profileData.id)
                .then(function (response) {
                    vm.reviews = response.data;
                })
                .finally(function () {
                    if (vm.canEdit) {
                        vm.welcomeReview = !_.isEmpty(vm.reviews) || JSON.parse(StorageService.get('welcome.review'));
                    }
                })
        };

        function getExperience() {
            experienceService
                .getUserExperience()
                .then(function (response) {
                    vm.experience = response.data || [];
                })
        };

        function openChat() {
            if (!vm.canEdit) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'openChat');
                $state.go('account.messages', { recipientId: vm.profileData.id }); 
            }
        }

        vm.endorsementsMap = {
            T: {
                title: 'Double/Triple Trailer',
                ico: 'ico-doubletraileractive'
            },
            P: {
                title: 'Passenger Vehicle',
                ico: 'ico-passengeractive'
            },
            S: {
                title: 'School Bus',
                ico: 'ico-doubletraileractive'
            },
            N: {
                title: 'Tank Truck',
                ico: 'ico-tankvehicleactive'
            },
            H: {
                title: 'Hazardous Materials',
                ico: 'ico-hazardousmaterialsactive'
            },
            X: {
                title: 'Tank + Hazardous',
                ico: 'ico-tankhazardousactive'
            }
        };
        vm.trucksMap = {
            'Peterbilt': 'ico ico-peterbilt-logo',
            'International': 'ico ico-international-logo',
            'Freightliner': 'ico ico-freightliner-logo',
            'Mack Trucks': 'ico ico-mack-logo',
            'Kenworth': 'ico ico-kenworth-logo',
            'Volvo': 'ico ico-volvo-logo'
        }
    }
})();
