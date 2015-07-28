(function() {
    'use strict';

    function ProfileCtrl(registerService) {
        var vm = this;
        vm.profileData = {};
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

    ProfileCtrl.$inject = ['registerService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
