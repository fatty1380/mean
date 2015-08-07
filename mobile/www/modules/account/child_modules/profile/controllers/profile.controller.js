(function() {
    'use strict';

    function ProfileCtrl(reviewService, experienceService, profileData, modalService) {
        var vm = this;
        vm.profileData = profileData;
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

        //var sampleReview = {
        //    user: '55b27b1893e595310272f1d0',
        //    reviewer: null,
        //    name: 'Anna S',
        //    email: 'Anna@gmail.com',
        //    title: 'On Time!',
        //    text: 'Have been working together for more then 7 years now!',
        //    rating: 4,
        //    created: '2014-12-04T00:59:41.249Z',
        //    modified: '2015-01-06T00:59:41.249Z'
        //};
        //

        //var experienceSample = {
        //    title: 'Aston Martin Driving Experience',
        //    description: 'Ever fancied yourself as the next James Bond? Why not have a go at a Trackdays.co.uk Aston Martin Driving Experience at one of our many venues across the UK?',
        //    startDate: '2007-09-18',
        //    endDate: '2008-02-12',
        //    location: 'San Francisco, CA'
        //};
        //vm.postExperience(experienceSample);

        vm.getReviews();
        vm.getExperience();

        vm.endorsementsMap = {
            T : {
                title: 'Double/Triple Trailer',
                ico: 'ico-doubletraileractive'
            },
            P : {
                title: 'Passenger Vehicle',
                ico: 'ico-passengeractive'
            },
            S : {
                title: 'School Bus',
                ico: 'ico-doubletraileractive'
            },
            N : {
                title: 'Tank Truck',
                ico: 'ico-tankvehicleactive'
            },
            H : {
                title: 'Hazardous Materials',
                ico: 'ico-hazardousmaterialsactive'
            },
            X : {
                title: 'Tank + Hazardous',
                ico: 'ico-tankhazardousactive'
            }
        };
        //
        //vm.me = (function(){
        //    registerService.me()
        //        .then(function (response) {
        //            if(response.success) {
        //                vm.profileData = response.message.data;
        //                console.log('-=-=-=-=-=-=-=-=-=-=-=-=- USER  OBJECT -=-=-=-=-=-=-=-=-=-=-=-=-', vm.profileData);
        //            }
        //        });
        //})();
    }

    ProfileCtrl.$inject = ['reviewService', 'experienceService', 'profileData', 'modalService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
