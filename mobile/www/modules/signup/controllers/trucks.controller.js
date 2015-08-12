(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrucksCtrl', TrucksCtrl)

    TrucksCtrl.$inject = ['$scope','$state','registerService', '$ionicPopup'];
    
    function TrucksCtrl($scope, $state, registerService, $ionicPopup ) {
        var TRUCKS = [
            {name: 'Peterbilt', logoClass: 'peterbilt-logo'},
            {name: 'International', logoClass: 'international-logo'},
            {name: 'Freightliner', logoClass: 'freightliner-logo'},
            {name: 'Mack Trucks', logoClass: 'mack-logo'},
            {name: 'Kenworth', logoClass: 'kenworth-logo'},
            {name: 'Volvo', logoClass: 'volvo-logo'}
        ];

        var vm = this;
        vm.newTruck = '';
        vm.currentTruck = '';

        vm.addTruck = addTruck;
        vm.continueToTrailers = continueToTrailers;
        vm.trucks = getTrucks();

        function addTruck() {
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTruck" autofocus>',
                title: 'Please enter your truck manufacturer',
                scope: $scope,
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
                        onTap: function (e) {
                            if (!vm.newTruck) {
                                e.preventDefault();
                            } else {
                                vm.trucks.push({name: vm.newTruck, logoClass: ''});
                                vm.currentTruck = vm.newTruck;
                                vm.newTruck = '';
                                return vm.newTruck;
                            }
                        }
                    }
                ]
            });
        }

        function continueToTrailers(isSave) {
            if (isSave) {
                registerService.setProps('truck', vm.currentTruck);
            }
            $state.go("signup/trailers");
        }

        function getTrucks() {
            return TRUCKS;
        }
    }
})();
