(function() {
    'use strict';

    function ProfileCtrl(registerService) {
        var vm = this;
        vm.profileData = {};
        // experience array data example. Rendering this till the user object will contain needed data
        vm.experience = [
            {
                title: 'Diamond Dan\'s  truck lines',
                message: 'Long Haul OTR Driver hauling Box Freight in West 11. Primrily dealing with HazMat materials hauling over high mountain passes',
                date: 'Oct 2007 - Nov 2014'
            },
            {
                title: 'Justdrive freight haulers',
                message: 'Short Haul, Long Haul, Box, Auto, Double, Triples and Tanks. I did it all.',
                date: 'Oct 2005 - Nov 2007'
            },
            {
                title: 'local courier services',
                message: 'Etiam porta sem malesuada magna mollis eusimod. Maecenas sed diam eget risus varius blandit sit amet non magna.',
                date: 'Oct 2001 - Nov 2005'
            },
            {
                title: 'Diamond Dan\'s  truck lines',
                message: 'Long Haul OTR Driver hauling Box Freight in West 11. Primrily dealing with HazMat materials hauling over high mountain passes',
                date: 'Oct 2000 - Nov 2001'
            },
            {
                title: 'Justdrive freight haulers',
                message: 'Short Haul, Long Haul, Box, Auto, Double, Triples and Tanks. I did it all.',
                date: 'Oct 1997 - Nov 2000'
            },
            {
                title: 'local courier services',
                message: 'Etiam porta sem malesuada magna mollis eusimod. Maecenas sed diam eget risus varius blandit sit amet non magna.',
                date: 'Oct 1995 - Nov 1997'
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
