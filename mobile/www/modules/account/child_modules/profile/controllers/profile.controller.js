(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$rootScope','$state', 'reviewService', 'experienceService', 'userService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($rootScope, $state, reviewService, experienceService, userService, avatarService, profileModalsService, cameraService, user, profile) {
        var vm = this;
        
        console.log('Loading $state: `%s`', $state.current.name);

        vm.profileData = profile || user;
        vm.user = user;
        vm.camera = cameraService;

        vm.canEdit = vm.profileData && vm.user ? vm.profileData.id === vm.user.id : false;

        vm.showFriends = showFriends;
        vm.openChat = openChat;

        $rootScope.$on("clear", function () {
            console.log('ProfileCtrl my event occurred');
            vm.profileData = profile || user;
            vm.user = user;
            vm.friendStatus = 0;
        });

        function showFriends() {
            console.log('TODO: Edit friends to adhere to \'profile\' resolve parameter');
            $state.go('account.profile.friends');
        }
        
        if (!vm.canEdit) {
            if (vm.profileData.isFriend || vm.profileData.friends.indexOf(user.id) !== -1) {
                vm.friendStatus = 1;
            }
            else if (vm.profileData.id === vm.user.id) {
                vm.friendStatus = -1;
            }
            else {
                vm.friendStatus = 0;
            }
            
            vm.doFriendAction = function doFriendAction(parameters) {
                switch (vm.friendStatus) {
                    case 0: alert('click ok to add ' + vm.profileData.displayName + ' to your convoy');
                        break;
                    case 1: alert('The convoy is strong with ' + vm.profileData.displayName);
                        break;
                    case -1: alert('this is you');
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
        }
        
        // This functionality has been moved to the "resolve"
        // attribute for 'userProfile' on the account.profile
        // and account.profile.user states.

        // THIS IS NEEDED ONLY FOR DEVELOPMENT
        // Function below is needed only for cases,
        // when you are loading state skipping the login stage.
        // For example directly loading profile state,
        // IN THE REGULAR APP WORKFLOW userService will already contain
        // all needed profile data.

        // (function () {
        //     var userPromise = userService.getUserData();
        //     if (userPromise.then) {
        //         userPromise.then(function (data) {
        //             console.log('--==--==--=-=-= PROFILE DATA ---=-=-=-=-=-=-=', data);
        //             vm.profileData = data;
        //         })
        //     }
        // })();

        vm.reviews = [];
        vm.experience = [];

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
        vm.postReview = function (id, review) {
            reviewService
                .postReviewForProfile(id, review)
        };
        /*vm.postExperience = function (experience) {
            experienceService
                .postUserExperience(experience)
        };*/

        vm.getReviews();
        vm.getExperience();

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
