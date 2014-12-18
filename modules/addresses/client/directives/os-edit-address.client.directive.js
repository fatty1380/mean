(function () {
    'use strict';

    function EditAddressDirective() {
        return {
            templateUrl: 'modules/addresses/views/edit-address.client.template.html',
            restrict: 'E',
            scope: {
                address: '=',
                enableEdit: '=?' // boolean
            },
            controller: 'OsEditAddressController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function EditAddressController() {
        var vm = this;

        vm.enableEdit = !!~this.enableEdit; // Default to _true_ if undefined

        vm.types = ['main', 'home', 'business', 'billing', 'other'];

        if (!vm.address.streetAddresses) {
            vm.address.streetAddresses = [];
        }
        while (vm.address.streetAddresses.length < 2) {
            vm.address.streetAddresses.push('');
        }
    }

    angular.module('addresses')
        .directive('osEditAddress', EditAddressDirective)
        .controller('OsEditAddressController', EditAddressController);

})();
