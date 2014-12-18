(function () {
    'use strict';

    function AddressListDirective() {
        return {
            templateUrl: 'modules/addresses/views/address-list.client.template.html',
            restrict: 'E',
            scope: {
                addresses: '=models',
                enableEdit: '=?', // boolean
                maxCount: '=?',
                required: '=?'
            },
            controller: 'OsAddressListController',
            controllerAs: 'vm',
            bindToController: true
        };
    }


    function AddressListController(Address) {

        var vm = this;

        vm.maxCount = vm.maxCount || 10;
        //vm.enableEdit = !!vm.enableEdit; // Default to _false_ if undefined
        vm.required = !!~vm.required; // Default to _true_ if undefined

        function activate() {
            if(!!vm.required && vm.addresses.length == 0) {
                vm.addresses.push({type: 'main', streetAddresses: ['']});
            }
        }

        activate();

        vm.addEnabled = function() {
            return !vm.enableEdit ? false : vm.addresses.length < vm.maxCount;
        };

        vm.removeEnabled = function() {
            return !vm.enableEdit || vm.required && vm.addresses.length === 1 ? false : true;
        };

        vm.addAddress = function () {
            // Prevent vm from bubbling up;
            event.preventDefault();

            var address = new Address({
                type: 'select type',
                streetAddresses: ['', '']
            });

            vm.addresses.push(address);
        };

        vm.removeAddress = function (address) {
            if (address) {
                for (var i in vm.addresses) {
                    if (vm.addresses[i] === address) {
                        vm.addresses.splice(i, 1);
                    }
                }
            }
        };

    }

    AddressListController.$inject = ['Addresses'];

    angular.module('addresses')
        .directive('osAddressList', AddressListDirective)
        .controller('OsAddressListController', AddressListController);

})();
