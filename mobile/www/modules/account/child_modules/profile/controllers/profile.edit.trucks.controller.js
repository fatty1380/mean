(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditTrucksCtrl', ProfileEditTrucksCtrl);

    ProfileEditTrucksCtrl.$inject = ['parameters', 'registerService', 'userService', 'truckService'];

    function ProfileEditTrucksCtrl (parameters, registerService, userService, truckService) {
        var vm = this;

        vm.currentTruck = '';
        vm.trucks = getTrucks();

        vm.save = save;
        vm.addTruck = addTruck;

        // ////////////////////////////////////////////////////////////

        function getTrucks () {
            var trucks = parameters.trucks,
                props = userService.profileData && userService.profileData.props,
                selectedTruck = props && props.truck || '',
                names;

            if (!selectedTruck) return trucks;

            names = trucks.map(function (truck) {
                return truck.name;
            });

            if (names.indexOf(selectedTruck) < 0) {
                trucks.push({ name: selectedTruck, logoClass: '' });
            }

            vm.currentTruck = selectedTruck;

            return trucks;
        }

        function addTruck () {
            truckService.addTruck().then(function (response) {
                if (!!response) {
                    vm.trucks.push(response);
                    vm.currentTruck = response.name;
                }
            });
        }

        function save () {

            return registerService.updateUserProps({ truck: vm.currentTruck })
                .then(function (updateResult) {
                    if (updateResult.success) {
                        registerService.userProps.truck = vm.currentTruck;
                        return vm.closeModal(vm.currentTruck);
                    }
                    return vm.cancelModal(updateResult.message);
                });
        }
    }

})();
