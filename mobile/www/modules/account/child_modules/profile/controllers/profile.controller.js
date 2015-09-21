(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$rootScope','$state', '$ionicTabsDelegate', 'reviewService', '$ionicLoading', 'experienceService', 'utilsService', 'friendsService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($rootScope, $state, $ionicTabsDelegate,  reviewService, $ionicLoading, experienceService, utilsService, friendsService,  avatarService, profileModalsService, cameraService, user, profile) {
        var vm = this;
        
        console.log('Loading $state: `%s`', $state.current.name);

        vm.profileData = profile || user;
        vm.user = user;
        vm.camera = cameraService;
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

            vm.experience = vm.profileData.experience;

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
            }
        }

        if (vm.canEdit) { // TODO: Restore this || vm.profileData.id === vm.user.id) {

            /**
             * showUserSettings
             * ----------------
             * Placeholder for showing app settings
             */
            vm.showUserSettings = null;

            vm.experience = vm.user.experience;

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
    }
})();
