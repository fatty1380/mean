(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

    ProfileCtrl.$inject = ['$scope', 'reviewService', 'experienceService', 'userService', 'profileModalsService', 'cameraService'];

    function ProfileCtrl($scope, reviewService, experienceService, userService, profileModalsService, cameraService) {
        var vm = this;

        vm.profileData = userService.getUserData();
        vm.camera = cameraService;

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

        // THIS IS NEEDED ONLY FOR DEVELOPMENT
        // Function below is needed only for cases,
        // when you are loading state skipping the login stage.
        // For example directly loading profile state,
        // IN THE REGULAR APP WORKFLOW userService will already contain
        // all needed profile data.

        (function () {
            var userPromise = userService.getUserData();
            if (userPromise.then) {
                userPromise.then(function (data) {
                    console.log('--==--==--=-=-= PROFILE DATA ---=-=-=-=-=-=-=', data);
                    vm.profileData = data;
                })
            }
        })();

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

        //update avatar after change data
        $scope.$watch(function () {
            return userService.profileData;
        },
        function () {
            vm.profileData = userService.profileData;
        }, true);

    }


})();
