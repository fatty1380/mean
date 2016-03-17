(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$rootScope', '$scope', 'StorageService', 'updateService', 'appCache', '$state', '$cordovaGoogleAnalytics', '$ionicHistory',
        'activityService', 'reviewService', 'LoadingService', 'experienceService',
        'friendsService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($rootScope, $scope, StorageService, updateService, appCache, $state, $cordovaGoogleAnalytics, $ionicHistory,
        activityService, reviewService, LoadingService, experienceService,
        friendsService, avatarService, ProfileModals, cameraService, user, profile) {

        var vm = this;

        logger.debug('Loading $state: `%s`', $state.current.name);

        vm.profileData = profile || user;
        // vm.profileAvatar =
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

        vm.goBack = function() {
            // ui-sref="account.profile({userId: null})" ui-sref-opts="{reload: true}"
            var backView = $ionicHistory.backView();

            if (_.isEmpty(backView) || _.isEmpty(backView.stateName)) {
                return $state.go('account.profile', { userId: null }, { reload: true });
            }

            return $ionicHistory.goBack();
        };

        vm.ab = function() {
            var profi = appCache.getCachedProfiles();
            logger.info(' Loaded Cached Profiles --->>>', profi);
        };

        var unbindUpdatesHandler = null;
        function destroy() {
            _.isFunction(unbindUpdatesHandler) && unbindUpdatesHandler();
        }

        $rootScope.$on('clear', function() {
            logger.debug('ProfileCtrl my event occurred');
            vm.profileData = profile || user;
            vm.user = user;
            vm.friendStatus = null;

            destroy();
        });

        $scope.$on('$ionicView.enter', function(event) {
            if (_.isEmpty(unbindUpdatesHandler)) {
                unbindUpdatesHandler = $rootScope.$on('updates-available', function(event, updates) {
                    logger.debug('ProfileCtrl: %d New updates available: ', updates);
                    vm.updates = updates;
                });
            }

            activate();

            getReviews();
        });

        $scope.$on('$ioncView.unloaded', function(event) {
            destroy();
        });

        function activate(updatedUser) {
            vm.profileData = updatedUser || profile || user;

            vm.thousandsOfMiles = null;
            vm.mileType = null;
            vm.milesMin = null;
            vm.milesMax = null;
            vm.timeMin = null;

            if (!_.isEmpty(vm.profileData.props)) {
                var props = vm.profileData.props;

                var miles;

                if (!!props.careerMiles) {
                    vm.mileType = 'career';
                    vm.mileUnits = props.mileUnit;
                    miles = Number(props.careerMiles);
                    vm.thousandsOfMiles = miles / 1000;
                }
                else if (!!props.miles || props.miles === 0) {
                    debugger;
                    vm.mileType = 'year';
                    miles = Number(props.miles);
                    if (miles < 1000) {
                        vm.mileUnit = '';
                        vm.thousandsOfMiles = miles;
                    }
                    else {
                        vm.thousandsOfMiles = miles >= 1000 ? miles / 1000 : miles;
                        vm.mileUnit = 'k';

                        if (vm.thousandsOfMiles >= 1000) {
                            if (vm.thousandsOfMiles === 2000) {
                                vm.milesMax = true;
                            }
                            vm.thousandsOfMiles = Number(vm.thousandsOfMiles / 1000).toFixed(1);
                            vm.mileUnit = 'm';
                        }

                        else if (vm.thousandsOfMiles === 0) {
                            vm.thousandsOfMiles = 100;
                            vm.milesMin = true;
                        }

                        else {
                            vm.thousandsOfMiles = Number(miles >= 1000 ? miles / 1000 : miles).toFixed(0);
                        }
                    }

                }

                if (!!props.started) {
                    vm.yearsDriving = moment().diff(moment(props.started, 'YYYY-MM'), 'years');

                    if (vm.yearsDriving === 0) {
                        vm.yearsDriving = 1;
                        vm.timeMin = true;
                    }
                }
            }
        }

        vm.welcomeExperience = angular.fromJson(StorageService.get('welcome.experience')) || !_.isEmpty(vm.user.experience);
        vm.welcomeReview = true;

        // ////////////////////////////////////////////////////////////////////////////////////////////

        function showFriends(event) {
            LoadingService.showLoader('Loading');
            event.stopPropagation();
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
                function(e) {
                    return '<li>' + vm.endorsementsMap[e].title + '</li>';
                });

            var endorsements = '<ul>' + listItems.join('') + '</ul>';

            LoadingService.show(title + endorsements, { noBackdrop: true });
        }

        /** ------ Viewing Profile User Configuration -------------------- */
        if (!vm.canEdit) {

            vm.feed = [];
            vm.experience = vm.profileData.experience || [];
            vm.isFriend = vm.profileData.friends.indexOf(vm.user.id) >= 0;
            vm.feedMessage = vm.isFriend ? 'No feed items' : 'You have to be friends to see user\'s feed';

            vm.addUserToFriends = addUserToFriends;
            vm.doFriendAction = doFriendAction;
            vm.acceptFriend = acceptFriend;

            if (!vm.isFriend) {
                vm.profileData.displayName = vm.profileData.firstName + ' ' + (vm.profileData.lastName && vm.profileData.lastName[0]);

                vm.messageClick = doFriendAction;
            }
            else {
                // LoadingService.showLoader('Loading ' + vm.profileData.firstName + '\'s Feed');
                vm.feedLoading = true;

                activityService
                    .getFeed().then(function(result) {
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
                    })
                    .finally(function() {
                        LoadingService.hide();
                        vm.feedLoading = false;
                    });

                vm.messageClick = function(event) {
                    openChat();
                };
            }

            friendsService
                .getFriendStatus(vm.profileData.id)
                .then(function(response) {
                    vm.friendStatus = response.data.status;
                    vm.friendRequest = response.data.request;
                });
        }

        /** -------- Viewing own-user configuration ------------------------ */
        if (vm.canEdit) { // TODO: Restore this || vm.profileData.id === vm.user.id) {

            vm.messageClick = gotoMessages;

            /**
             * showUserSettings
             * ----------------
             * Placeholder for showing app settings
             */
            vm.showUserSettings = null;
            getExperience();

            vm.expInstructText = '<p>This is your profile’s experience section where you can keep a digital record of your work experience - think of it like a digital resume. Add your past jobs here and add details about all your responsibilities to present a full picture of your professional abilities.</p>' +
                '<p class="message">Get started with the <strong>Add Experience</strong> button below</p>';

            /**
             * showEditAvatar
             * --------------
             * Opens an action sheet which leads to either taking
             * a photo, or selecting from device photos.
             */
            vm.showEditAvatar = function(parameters) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'editAvatar');
                avatarService.getNewAvatar(parameters, vm.profileData);
            };

            /**
             * showEditModal
             * -------------
             * Shows the "Edit User" modal screen to allow
             * editing of user's name, properties, etc
             */
            vm.showEditModal = function(target) {
                LoadingService.showLoader();
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'showEdit');

                ProfileModals
                    .showProfileEditModal({ target: target })
                    .then(function(result) {
                        if (result) {
                            activate(result);
                            // vm.profileData = result;
                        }
                    });
            };

            /**
             * vm.showAddExperienceModal
             * -------------------------
             * This "function" is passed into the experienceList directive and references
             * functionality defined therein
             *  */

            vm.showExperienceListModal = function showExperienceListModal() {
                return ProfileModals
                    .showListExperienceModal({ experience: vm.experience })
                    .then(function success(experience) {
                        vm.experience = experience;
                    });
            };

            vm.showShareModal = function(parameters) {
                LoadingService.showLoader();
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'showShare');

                ProfileModals
                    .showProfileShareModal(parameters)
                    .then(function(result) {
                        logger.debug(result);
                    },
                    function(err) {
                        logger.debug(err);
                    });
            };

            vm.showRequestReviewModal = function(parameters) {
                LoadingService.showLoader();
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'showRequestReview');

                ProfileModals
                    .showRequestReviewModal(parameters)
                    .then(function(result) {
                        logger.debug(result);
                    },
                    function(err) {
                        logger.debug(err);
                    });
            };
        }
        // END: vm.canEdit

        vm.showProfileTab = showProfileTab;
        vm.showReviewTab = showReviewTab;
        vm.showExperienceTab = showExperienceTab;
        vm.getReviewBadge = getReviewBadge;
        vm.getExperienceBadge = getExperienceBadge;

        function showProfileTab(event) {
            !!event && event.preventDefault();

            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showReviews');
            $cordovaGoogleAnalytics.trackView(vm.canEdit ? 'account.profile' : 'user.profile');
        }

        function showReviewTab(event) {
            !!event && event.preventDefault();

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

        function showExperienceTab(event) {
            !!event && event.preventDefault();

            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'showExperience');
            $cordovaGoogleAnalytics.trackView((vm.canEdit ? 'account.profile' : 'user.profile') + '.experience');
            if (vm.canEdit && !vm.welcomeExperience) {
                vm.welcomeExperience = 'true';
                StorageService.set('welcome.experience', 'true');
            }
        }

        function getReviewBadge() {
            if (vm.canEdit) {

                if (!!vm.updates.reviews) {
                    return vm.updates.reviews;
                }

                if (!vm.welcomeReview) {
                    return '+';
                }
            }

            return null;
        }

        function getExperienceBadge() {
            if (vm.canEdit && !vm.welcomeExperience) {
                return '+';
            }

            return null;
        }

        function getReviews() {
            reviewService
                .getReviewsByUserID(vm.profileData.id)
                .then(function(response) {
                    vm.reviews = response.data;
                })
                .finally(function() {
                    if (vm.canEdit) {
                        vm.welcomeReview = !_.isEmpty(vm.reviews) || angular.fromJson(StorageService.get('welcome.review'));
                    }
                });
        }

        function getExperience() {
            experienceService
                .getUserExperience()
                .then(function(response) {
                    vm.experience = response.data || [];
                });
        }

        function openChat() {
            if (!vm.canEdit && vm.friendStatus === 'friends') {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'openChat');
                $state.go('account.messages', { recipientId: vm.profileData.id });
            }
        }

        function gotoMessages() {
            if (vm.canEdit) {
                $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'gotoInbox');
                $state.go('account.messages');
            }
        }



        // "Other User" functions - START
        function addUserToFriends() {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'addUserToFriends');
            var friend = vm.profileData;

            if (!friend) return;

            var requestData = {
                to: friend.id,
                text: 'Hi there! I want to add you to my friend list!'
            };

            friendsService
                .createRequest(requestData)
                .then(function(createdRequestResp) {
                    if (createdRequestResp.status === 200) {
                        vm.friendStatus = 'sent';
                        var template = 'You have invited ' + friend.firstName + ' to be friends.';
                        LoadingService.showSuccess(template);

                    }
                });
        }

        function doFriendAction() {
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
        }

        function acceptFriend() {
            $cordovaGoogleAnalytics.trackEvent('Profile', vm.canEdit ? 'home' : 'view', 'acceptFriend');
            friendsService
                .updateRequest(vm.friendRequest.id, { action: 'accept' })
                .then(function(result) {
                    if (result.status === 200) {
                        vm.friendStatus = 'friends';
                        user.friends.push(vm.friendRequest.from);
                        var template = 'Added ' + (vm.profileData.handle || vm.profileData.firstName) + ' to your convoy';
                        LoadingService.showSuccess(template);
                    }
                });
        }

        // Other User Function --- END

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
        };
    }
})();
