(function () {
    'use strict';

    angular
        .module('signup')
        .factory('truckService', truckService);

    truckService.$inject = ['$q', '$ionicPopup', '$rootScope'];

    function truckService ($q, $ionicPopup, $rootScope) {
        var TRUCKS = [
            {name: 'Peterbilt', logoClass: 'ico ico-peterbilt-logo'},
            {name: 'International', logoClass: 'ico ico-international-logo'},
            {name: 'Freightliner', logoClass: 'ico ico-freightliner-logo'},
            {name: 'Mack Trucks', logoClass: 'ico ico-mack-logo'},
            {name: 'Kenworth', logoClass: 'ico ico-kenworth-logo'},
            {name: 'Volvo', logoClass: 'ico ico-volvo-logo'}
        ];

        function getTrucks () {
            var deferred = $q.defer();

            if(TRUCKS.length) deferred.resolve(TRUCKS);

            return deferred.promise;
        }

        function addTruck() {
            var scope = $rootScope.$new();
            scope.vm = {};

            return $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.truck" autofocus>',
                title: 'Please enter a truck type',
                scope: scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            scope.vm.truck = '';
                            return null;
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!scope.vm.truck) {
                                e.preventDefault();
                            } else {
                                return {name:scope.vm.truck, logoClass: ''};
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


