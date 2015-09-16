(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditTrucksCtrl', ProfileEditTrucksCtrl);

    ProfileEditTrucksCtrl.$inject = ['$scope', 'parameters', 'registerService', 'userService', 'truckService'];

    function ProfileEditTrucksCtrl($scope, parameters, registerService, userService, truckService) {
        var vm = this;

        vm.currentTruck = '';
        vm.trucks = getTrucks();

        vm.cancel = cancel;
        vm.save = save;
        vm.addTruck = addTruck;

        function cancel (truck) {
            $scope.closeModal(truck);
        }

        function getTrucks () {
            var trucks = parameters.trucks,
                props = userService.profileData && userService.profileData.props,
                selectedTruck = props && props.truck || '',
                names;

            if(!selectedTruck) return trucks;

            names = trucks.map(function (truck) {
                return truck.name;
            });

            if(names.indexOf(selectedTruck) < 0){
                trucks.push({name: selectedTruck, logoClass: ''});
            }

            vm.currentTruck = selectedTruck;

            return trucks;
        }

        function addTruck () {
            truckService.addTruck().then(function (response) {
                vm.trucks.push(response);
                vm.currentTruck = response.name;
            });
        }

        function save () {
            registerService.setProps('truck', vm.currentTruck);
            registerService.updateUser(registerService.getDataProps());

            cancel(vm.currentTruck);
        }
    }

})();
