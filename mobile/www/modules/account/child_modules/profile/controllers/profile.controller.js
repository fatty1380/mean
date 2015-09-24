(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$rootScope', 'updateService', '$state', 'activityService', 'reviewService', '$ionicLoading', 'experienceService', 'utilsService', 'friendsService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($rootScope, updateService, $state, activityService,  reviewService, $ionicLoading, experienceService, utilsService, friendsService,  avatarService, profileModalsService, cameraService, user, profile) {
        var vm = this;
        
        console.log('Loading $state: `%s`', $state.current.name);

        vm.profileData = profile || user;
        vm.user = user;
        vm.camera = cameraService;
        vm.updates = updateService.getLastUpdates();
        vm.reviews = [];

        vm.canEdit = vm.profileData && vm.user ? vm.profileData.id === vm.user.id : false;

        vm.showFriends = showFriends;
        vm.openChat = openChat;
        vm.friendStatus = null;

        $rootScope.$on("clear", function () {
            console.log('ProfileCtrl my event occurred');
            vm.profileData = profile || user;
            vm.user = user;
            vm.friendStatus = null;
        });

        function showFriends() {
            console.log('TODO: Edit friends to adhere to \'profile\' resolve parameter');
            $state.go('account.profile.friends');
        }
        
        if (!vm.canEdit) {

            vm.feed = [];
            vm.experience = vm.profileData.experience;
            vm.isFriend = vm.profileData.friends.indexOf(vm.user.id) >= 0;
            vm.feedMessage = vm.isFriend ? 'No feed items' : 'You have to be friends to see user\'s feed';

            if(!vm.isFriend){
                vm.profileData.displayName = vm.profileData.firstName + ' ' + (vm.profileData.lastName && vm.profileData.lastName[0]);
            }else{
                $ionicLoading.show({template: 'Loading ' + vm.profileData.firstName + '\'s Feed...'});
                activityService
                    .getFeed().then(function (result) {

                        var sortedItems = [];

                        for (var i = 0; i < result.length; i++) {
                            var item = result[i],
                                userID = item.user && item.user.id;

                            if(userID === vm.profileData.id){
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
                    if(status) vm.friendStatus = status;
                });


            vm.addUserToFriends = function () {
                var friend = vm.profileData;

                if(!friend) return;

                var requestData = {
                    to: friend.id,
                    text: 'Hi there! I want to add you to my friend list!'
                },

                serializedData = utilsService.serialize(requestData);

                friendsService
                    .createRequest(serializedData)
                    .then(function (createdRequestResp) {
                        if(createdRequestResp.status === 200){
                            vm.friendStatus = 'sent';
                            var template = 'You have invited ' + friend.firstName + ' to be friends.';
                            $ionicLoading
                                .show({template:template, duration: 2000});

                        }
                    });
            };

            vm.doFriendAction = function doFriendAction(parameters) {
                switch (vm.friendStatus) {
                    case 'none':
                        vm.addUserToFriends();
                        break;
                    case 'friends': alert('The convoy is strong with ' + vm.profileData.displayName);
                        break;
                    case 'sent': alert('Already sent the invitation to ' + vm.profileData.displayName);
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

            vm.experience = vm.user.experience;

            $rootScope.$on('updates-available', function (event, updates) {
                vm.updates = updates;
            });

            /**
             * showEditAvatar
             * --------------
             * Opens an action sheet which leads to either taking
             * a photo, or selecting from device photos.
             */
            vm.showEditAvatar = function (parameters) {
                vm.camera.showActionSheet()
                    .then(function success(rawImageResponse) {
                        return avatarService.showEditModal(rawImageResponse);
                    })
                    .then(function success(newImageResponse) {
                        vm.profileData.profileImageURL = vm.profileData.props.avatar = newImageResponse || avatarService.getImage();
                    })
                    .catch(function reject(err) {
                        debugger;
                    });
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
                    .then(
                        function (result) {
                            if(!!result){
                                vm.profileData = result;
                            }
                    },
                    function (err) {
                        console.log(err);
                    })
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
                    .then(function (result) {
                        console.log(result);
                        vm.getExperience();
                    },
                    function (err) {
                        console.log(err);
                    })
            };

            vm.showEditExperienceModal = function (parameters) {
                profileModalsService
                    .showEditExperienceModal(parameters)
                    .then(function (result) {
                        console.log(result);
                        vm.getExperience();
                    },
                    function (err) {
                        console.log(err);
                    })
            };

            vm.getReviews = function () {
                reviewService
                    .getUserReviews()
                    .then(function (response) {
                        vm.reviews = response.data;
                    })
            };
            vm.getExperience = function () {
                experienceService
                    .getUserExperience()
                    .then(function (response) {
                        vm.experience = response.data;
                    })
            };
        }


        vm.getReviews = function () {
            reviewService
                .getUserReviews()
                .then(function (response) {
                    vm.reviews = response.data;
                })
        };

        vm.postReview = function (id, review) {
            reviewService
                .postReviewForProfile(id, review)
        };

        vm.getReviews();

        function openChat() {
            if(!vm.canEdit){
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
