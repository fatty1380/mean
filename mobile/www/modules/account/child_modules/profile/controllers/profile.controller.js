(function() {
    'use strict';

    function ProfileCtrl(registerService, reviewService) {
        var vm = this;
        vm.profileData = {};
        vm.reviews = [];

        vm.getReviews = function () {
            reviewService
                .getUserReviews()
                .then(function (response) {
                    console.log('Reviews List', response);
                    vm.reviews = response.data;
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
        //vm.postReview = function (id, review) {
        //    reviewService
        //        .postReviewForProfile(id, review)
        //        .then(function (response) {
        //            console.log('posted response', response);
        //        })
        //};

        //vm.postReview('55b27b1893e595310272f1d0', sampleReview);

        vm.getReviews();

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
        // experience array data example. Rendering this till the user object will contain needed data
        vm.experience = [
            {
                title: 'Diamond Dan\'s  truck lines',
                description: 'Long Haul OTR Driver hauling Box Freight in West 11. Primrily dealing with HazMat materials hauling over high mountain passes',
                startDate : '2007-12-03',
                endDate : '2014-11-06',
                location : 'Seattle, WA'
            },
            {
                title: 'Justdrive freight haulers',
                description: 'Short Haul, Long Haul, Box, Auto, Double, Triples and Tanks. I did it all.',
                startDate : '2007-12-03',
                endDate : '2014-11-06',
                location : 'Seattle, WA'
            },
            {
                title: 'local courier services',
                description: 'Etiam porta sem malesuada magna mollis eusimod. Maecenas sed diam eget risus varius blandit sit amet non magna.',
                startDate : '2007-12-03',
                endDate : '2014-11-06',
                location : 'Seattle, WA'
            },
            {
                title: 'Diamond Dan\'s  truck lines',
                description: 'Long Haul OTR Driver hauling Box Freight in West 11. Primrily dealing with HazMat materials hauling over high mountain passes',
                startDate : '2007-12-03',
                endDate : '2014-11-06',
                location : 'Seattle, WA'
            },
            {
                title: 'Justdrive freight haulers',
                description: 'Short Haul, Long Haul, Box, Auto, Double, Triples and Tanks. I did it all.',
                startDate : '2007-12-03',
                endDate : '2014-11-06',
                location : 'Seattle, WA'
            },
            {
                title: 'local courier services',
                description: 'Etiam porta sem malesuada magna mollis eusimod. Maecenas sed diam eget risus varius blandit sit amet non magna.',
                startDate : '2007-12-03',
                endDate : '2014-11-06',
                location : 'Seattle, WA'
            }
        ];
        vm.me = (function(){
            registerService.me()
                .then(function (response) {
                    if(response.success) {
                        vm.profileData = response.message.data;
                        console.log('-=-=-=-=-=-=-=-=-=-=-=-=- USER  OBJECT -=-=-=-=-=-=-=-=-=-=-=-=-', vm.profileData);
                    }
                });
        })();
    }

    ProfileCtrl.$inject = ['registerService', 'reviewService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
