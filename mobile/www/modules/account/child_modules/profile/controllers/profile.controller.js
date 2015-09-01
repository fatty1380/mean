(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$state', 'reviewService', 'experienceService', 'userService', 'avatarService', 'profileModalsService', 'cameraService', 'user', 'profile'];

    function ProfileCtrl($state, reviewService, experienceService, userService, avatarService, profileModalsService, cameraService, user, profile) {
        var vm = this;

        if (!$state.is('account.profile')) {
            console.log('Loading $state: `%s`', $state.current.name);
        }

        vm.profileData = profile || user;
        vm.user = user;
        vm.camera = cameraService;

        vm.showFriends = showFriends;

        function showFriends() {
            $state.go('account.profile.friends');
        }

        if ($state.is('account.profile') || vm.profileData.id === vm.user.id) {

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
                    .then(function success(newImageResponse) {
                        vm.profileData.props.avatar = newImageResponse || avatarService.getImage();
                    })
                    .catch(function reject(err) {
                        debugger;
                    });
            }

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
                        console.log(result);
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
        vm.postExperience = function (experience) {
            experienceService
                .postUserExperience(experience)
        };

        vm.getReviews();
        vm.getExperience();

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
