(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrucksCtrl', TrucksCtrl)

    TrucksCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', 'LoadingService'];

    function TrucksCtrl($scope, $state, registerService, $ionicPopup, LoadingService) {
        var TRUCKS = [
            { name: 'Peterbilt', logoClass: 'ico ico-peterbilt-logo' },
            { name: 'International', logoClass: 'ico ico-international-logo' },
            { name: 'Freightliner', logoClass: 'ico ico-freightliner-logo' },
            { name: 'Mack Trucks', logoClass: 'ico ico-mack-logo' },
            { name: 'Kenworth', logoClass: 'ico ico-kenworth-logo' },
            { name: 'Volvo', logoClass: 'ico ico-volvo-logo' }
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
                                vm.trucks.push({ name: vm.newTruck, logoClass: '' });
                                vm.currentTruck = vm.newTruck;
                                vm.newTruck = '';
                                debugger;
                                return vm.currentTruck;
                            }
                        }
                    }
                ]
            });
        }

        function continueToTrailers(isSave) {
            if (isSave) {
                registerService.userProps.truck = vm.currentTruck;
                LoadingService.showLoader('Saving');

                registerService.updateUserProps({ truck: vm.currentTruck })
                    .then(function (response) {
                        if (response.success) {
                            console.log('Trucks: Saved Successfully', response.message);
                        } else {
                            console.error('Trucks: Save Failed', response.message);
                        }

                        $state.go('signup-trailers');
                    })
                    .finally(function () {
                        LoadingService.hide();
                    });

            } else {
                $state.go('signup-trailers');
            }
        }

        function getTrucks() {
            return TRUCKS;
        }
    }
})();
