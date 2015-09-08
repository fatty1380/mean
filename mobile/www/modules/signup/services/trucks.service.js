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
            var scope = $rootScope.$new();
            scope.vm = {};

            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.truck" autofocus>',
                title: 'Please enter a truck type',
                scope: scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            scope.vm.truck = '';
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!scope.vm.truck) {
                                e.preventDefault();
                            } else {
                                TRUCKS.push({name:scope.vm.truck, checked:true, logoClass: ''});
                                scope.vm.truck = '';
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


