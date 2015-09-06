(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditTrucksCtrl', ProfileEditTrucksCtrl);

    ProfileEditTrucksCtrl.$inject = ['$scope', 'parameters', 'registerService'];

    function ProfileEditTrucksCtrl($scope, parameters, registerService) {
        var vm = this;

        vm.newTruck = '';
        vm.trucks = parameters.trucks;

        vm.cancel = cancel;
        vm.save = save;

        function cancel (truck) {
            $scope.closeModal(truck);
        }

        function save () {
            registerService.setProps('truck', vm.newTruck);
            registerService.updateUser(registerService.getDataProps());

            cancel(vm.newTruck);
        }
    }

})();
