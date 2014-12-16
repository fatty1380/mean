(function () {
    'use strict';

    function AddressItemDirective() {
        return {
            templateUrl: 'modules/addresses/views/address.client.template.html',
            restrict: 'E',
            scope: {
                address: '=model',
                enableEdit: '=?' // boolean
            },
            controller: 'OsAddressItemController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function AddressItemController($modal) {

        var vm = this;

        vm.enableEdit = !!this.enableEdit; // Default to _false_ if undefined
        vm.isOpen = false;

        function activate() {
            if (!!vm.address) {
                vm.typeVal = vm.address.type === 'other' ? (vm.address.typeOther || vm.address.type) : vm.address.type;
            }
        }

        activate();

        vm.editAddress = function () {
            debugger;
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
