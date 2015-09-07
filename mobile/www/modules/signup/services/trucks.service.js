(function () {
    'use strict';

    angular
        .module('signup')
        .factory('truckService', truckService);

    truckService.$inject = ['$q', '$ionicPopup', '$rootScope'];

    function truckService ($q, $ionicPopup, $rootScope) {
        var TRUCKS = [
            {name: 'Peterbilt', logoClass: 'peterbilt-logo'},
            {name: 'International', logoClass: 'international-logo'},
            {name: 'Freightliner', logoClass: 'freightliner-logo'},
            {name: 'Mack Trucks', logoClass: 'mack-logo'},
            {name: 'Kenworth', logoClass: 'kenworth-logo'},
            {name: 'Volvo', logoClass: 'volvo-logo'}
        ];

        function getTrucks () {
            var deferred = $q.defer();

            if(TRUCKS.length) deferred.resolve(TRUCKS);

            return deferred.promise;
        }

        function addTruck() {
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTruck" autofocus>',
                title: 'Please enter a trailer type',
                scope: $rootScope.new(),
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            vm.newTruck = '';
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!vm.newTruck) {
                                e.preventDefault();
                            } else {
                                TRUCKS.push({name:vm.newTruck, checked:true, logoClass: ''});
                                vm.newTruck = '';
                                return TRUCKS;
                            }
                        }
                    }
                ]
            });
        }

        return {
            getTrucks: getTrucks,
            addTruck: addTruck
        };

    }
    
})();


