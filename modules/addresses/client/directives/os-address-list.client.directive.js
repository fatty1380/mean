(function () {
    'use strict';

    function AddressListDirective() {
        return {
            templateUrl: 'modules/addresses/views/address-list.client.template.html',
            restrict: 'E',
            scope: {
                addresses: '=models',
                isEditing: '=?', // boolean
                allowEdit: '=?',
                maxCount: '=?',
                required: '=?',
                fullWidth: '=?'
            },
            controller: 'OsAddressListController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function AddressListEditDirective() {
        debugger;
        var base = AddressListDirective();

        base.templateUrl= 'modules/addresses/views/address-list-edit.client.template.html';

        return base;
    }


    function AddressListController() {

        var vm = this;

        // #region bindable methods

        vm.updateFunctionality = updateFunctionality;
        vm.addAddress = addAddress;
        vm.removeAddress = removeAddress;

        // #region initialization & activation

        vm.maxCount = vm.maxCount || 10;

        vm.required = (typeof vm.required === 'boolean' ? vm.required : !!~vm.required); // Default to _true_ if undefined
        vm.fullWidth = (typeof vm.fullWidth === 'boolean' ? vm.fullWidth : !!vm.fullWidth); // Default to _false_ if undefined
        vm.isEditing = (typeof vm.isEditing === 'boolean' ? vm.isEditing : !!vm.isEditing); // Default to _false_ if undefined
        vm.canEdit = (typeof vm.canEdit === 'boolean' ? vm.canEdit : !!~vm.canEdit); // Default to _true_ if undefined
        vm.canAdd = vm.canRemove = vm.canEdit;

        function activate() {
            if (vm.required && (!vm.addresses || vm.addresses.length === 0)) {
                pushStub();
            }

            updateFunctionality();
        }

        activate();

        // #region public method implementation

        function updateFunctionality() {
            vm.canAdd = addEnabled();
            vm.canRemove = removeEnabled();
        }

        function addEnabled() {
            return !vm.canEdit ? false : !vm.addresses || vm.addresses.length < vm.maxCount;
        }

        function removeEnabled() {
            return !vm.canEdit || vm.required && vm.addresses.length === 1 ? false : true;
        }

        function addAddress() {
            // Prevent vm from bubbling up;
            event.preventDefault();

            pushStub();
        }

        function removeAddress(address) {
            if (address) {
                for (var i in vm.addresses) {
                    if (vm.addresses[i] === address) {
                        vm.addresses.splice(i, 1);
                    }
                }
            }
        }

        // #region private members

        function pushStub() {
            if (!vm.addresses) {
                vm.addresses = [];
            }

            vm.addresses.push(angular.copy(addressStub));
        }

        var addressStub = {
            type: '',
            streetAddresses: ['', '']
        };

    }


    angular.module('addresses')
        .directive('osAddressList', AddressListDirective)
        .directive('osEditAddressList', AddressListEditDirective)
        .controller('OsAddressListController', AddressListController);

})
();
