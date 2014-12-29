(function () {
    'use strict';

    function AddressItemDirective() {
        return {
            templateUrl: 'modules/addresses/views/address.client.template.html',
            restrict: 'E',
            scope: {
                address: '=model',
                isEditing: '=?', // boolean
                allowEdit: '=?',
                enableRemove: '&?'
            },
            controller: 'OsAddressItemController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function AddressItemController($modal) {

        var vm = this;

        vm.allowEdit = !!this.allowEdit; // Default to _false_ if undefined
        vm.enableRemove = vm.enableRemove || function() { return vm.allowEdit; };
        vm.isOpen = false;

        function activate() {
            if (!!vm.address) {
                vm.typeVal = vm.address.type === 'other' ? (vm.address.typeOther || vm.address.type) : vm.address.type;
            }
        }

        activate();

        vm.editAddress = function () {
            var modalInstance = $modal.open({
                templateUrl: 'addressEditModal.html',
                controllerAs: 'modalCtrl'
            });

            modalInstance.result.then(function (result) {
                console.log('Modal result %o', result);
                debugger; //todo: push result into 'addresses'
                vm.isOpen = false;
            }, function (result) {
                console.log('Modal dismissed at: ' + new Date());
                vm.isOpen = false;
            });

            modalInstance.opened.then(function (args) {
                vm.isOpen = true;
            });
        };
    }

    AddressItemController.$inject = ['$modal'];

    angular.module('addresses')
        .directive('osAddress', AddressItemDirective)
        .controller('OsAddressItemController', AddressItemController);

})();
