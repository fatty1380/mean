(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$rootScope', 'updateService', 'appCache', '$state', 'activityService', 'reviewService', '$ionicLoading', 'experienceService', 'utilsService', 'friendsService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($rootScope, updateService, appCache, $state, activityService, reviewService, $ionicLoading, experienceService, utilsService, friendsService, avatarService, profileModalsService, cameraService, user, profile) {
        var vm = this;

        console.log('Loading $state: `%s`', $state.current.name);

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
            console.warn(' profi --->>>', profi);
        };

        var unbindUpdatesHandler = null;
        function destroy() {
            _.isFunction(unbindUpdatesHandler) && unbindUpdatesHandler();
        }

        $rootScope.$on("clear", function () {
            console.log('ProfileCtrl my event occurred');
            vm.profileData = profile || user;
            vm.user = user;
            vm.friendStatus = null;

            destroy();
        });

        $scope.$on('$ionicView.enter', function (event) {
            if (_.isEmpty(unbindUpdatesHandler)) {
                unbindUpdatesHandler = $rootScope.$on('updates-available', function (event, updates) {
                    console.log('ProfileCtrl: %d New updates available: ', updates);
                    vm.updates = updates;
                });
            }

            getReviews();
        });

        $scope.$on('$ioncView.unloaded', function (event) {
            destroy();
        });
        vm.welcomeReview = true;

        function showFriends() {
            console.log('TODO: Edit friends to adhere to \'profile\' resolve parameter');
            $state.go('account.profile.friends', { userId: profile && profile.id });
        }

        function showEndorsements() {

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

            $ionicLoading.show({
                template: title + endorsements,
                duration: 2000,
                noBackdrop: true
            });
        }

        if (!vm.canEdit) {

            vm.feed = [];
            vm.experience = vm.profileData.experience || [];
            vm.isFriend = vm.profileData.friends.indexOf(vm.user.id) >= 0;
            vm.feedMessage = vm.isFriend ? 'No feed items' : 'You have to be friends to see user\'s feed';

            if (!vm.isFriend) {
                vm.profileData.displayName = vm.profileData.firstName + ' ' + (vm.profileData.lastName && vm.profileData.lastName[0]);
            } else {
                $ionicLoading.show({ template: 'Loading ' + vm.profileData.firstName + '\'s Feed...' });
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
                        $ionicLoading.hide();
                    }, function (err) {
                        $ionicLoading.hide();
                    });
            }

            friendsService
                .getFriendStatus(vm.profileData.id)
                .then(function (response) {
                    var status = response.data.status;
                    if (status) vm.friendStatus = status;
                });


            vm.addUserToFriends = function () {
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
                            $ionicLoading
                                .show({ template: template, duration: 2000 });

                        }
                    });
            };

            vm.doFriendAction = function doFriendAction(parameters) {
                switch (vm.friendStatus) {
                    case 'none':
                        vm.addUserToFriends();
                        break;
                    case 'friends':
                        console.log('The convoy is strong with ' + vm.profileData.displayName);
                        break;
                    case 'sent':
                        console.log('Already sent the invitation to ' + vm.profileData.displayName);
                        break;
                }
            };
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
                avatarService.getNewAvatar(parameters, vm.profileData);
            };

            /**
             * showEditModal
             * -------------
             * Shows the "Edit User" modal screen to allow
             * editing of user's name, properties, etc
             */
            vm.showEditModal = function (parameters) {
                profileModalsService
                    .showProfileEditModal(parameters)
                    .then(function (result) {
                        if (!!result) vm.profileData = result;
                    });
            };

            vm.showShareModal = function (parameters) {
                profileModalsService
                    .showProfileShareModal(parameters)
                    .then(function (result) {
                        console.log(result);
                    },
                        function (err) {
                            console.log(err);
                        })
            };

            vm.showRequestReviewModal = function (parameters) {
                profileModalsService
                    .showRequestReviewModal(parameters)
                    .then(function (result) {
                        console.log(result);
                    },
                        function (err) {
                            console.log(err);
                        })
            };

            vm.showAddExperienceModal = function (parameters) {
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
                        if (!!err) { console.log(err); }
                    })
            };

            vm.showEditExperienceModal = function (experienceItem) {
                profileModalsService
                    .showEditExperienceModal(experienceItem)
                    .then(function (experienceResult) {
                        console.log('Edited Experience ', experienceResult);

                        if (_.isArray(experienceResult)) {
                            vm.experience = experienceResult;
                        } else {
                            vm.experience.push(experienceResult);
                        }
                        
                        //experienceItem = result;
                        getExperience();
                    })
                    .catch(function (err) {
                        if (!!err) { console.log(err); }
                    })
            };
        }
        // END: vm.canEdit

        vm.showReviewTab = function () {
            if (vm.canEdit) {
                updateService.resetUpdates('reviews');

                if (!vm.welcomeReview) {
                    vm.welcomeReview = 'true';
                    StorageService.set('welcome.review', 'true');
                }
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
