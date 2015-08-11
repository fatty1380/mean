(function() {
    'use strict';

    function ProfileCtrl($scope, reviewService, experienceService, userService, modalService, cameraService) {
        var vm = this;

        vm.modal = modalService;
        vm.profileData = userService.getUserData();
        vm.camera = cameraService;


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
                    vm.profileData = data;
                })
            }
        })();

        vm.reviews = [];
        vm.experience = [];

        vm.showModal = function (modalName) {
            modalService.show(modalName);
        };

        vm.closeModal = function (modalName) {
            modalService.close(modalName);
        };

        vm.getReviews = function () {
            reviewService
                .getUserReviews()
                .then(function (response) {
                    console.log('Reviews List', response);
                    vm.reviews = response.data;
                })
        };
        vm.getExperience = function () {
            experienceService
                .getUserExperience()
                .then(function (response) {
                    console.log('Experience List', response);
                    vm.experience = response.data;
                })
        };
        vm.postReview = function (id, review) {
            reviewService
                .postReviewForProfile(id, review)
                .then(function (response) {
                    console.log('posted response', response);
                })
        };
        vm.postExperience = function (experience) {
            experienceService
                .postUserExperience(experience)
                .then(function (response) {
                    console.log('posted experience', response);
                })
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


        vm.showModal = function (modalName) {
            modalService.show(modalName);
        };

        vm.closeModal = function (modalName) {
            modalService.close(modalName);
        };
    }

    ProfileCtrl.$inject = ['$scope', 'reviewService', 'experienceService', 'userService', 'modalService', 'cameraService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
