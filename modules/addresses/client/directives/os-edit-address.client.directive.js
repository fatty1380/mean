(function () {
    'use strict';

    function EditAddressDirective() {
        return {
            templateUrl: 'modules/addresses/views/edit-address.client.template.html',
            restrict: 'E',
            scope: {
                address: '=',
                enableEdit: '=?', // boolean
                enableRemove: '=?'
            },
            controller: 'OsEditAddressController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function EditAddressController($log) {
        var vm = this;

        vm.enableRemove = !!~this.enableRemove;

        vm.types = ['main', 'home', 'business', 'billing'];
        vm.type = {
            isopen: false
        };

        if (!vm.address.streetAddresses) {
            vm.address.streetAddresses = [];
        }
        while (vm.address.streetAddresses.length < 2) {
            vm.address.streetAddresses.push('');
        }

        vm.setType = function(newType, $event) {
            $log.log('type set to: ', newType);
            vm.address.type = newType;
            vm.type.isopen = false;
        };

        vm.toggleDropdown = function($event) {
            $log.log('toggling dropdown from %o to %o via event %o', vm.type.isopen, !vm.type.isopen, $event);
            $event.preventDefault();
            $event.stopPropagation();
            vm.type.isopen = !vm.type.isopen;
        };

        vm.toggled = function(open) {
            $log.log('Dropdown is now: ', open);
        };
    }

    EditAddressController.$inject = ['$log'];

    angular.module('addresses')
        .directive('osEditAddress', EditAddressDirective)
        .controller('OsEditAddressController', EditAddressController);

})();
