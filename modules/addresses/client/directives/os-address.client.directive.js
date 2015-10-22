(function () {
    'use strict';

    function AddressItemDirective() {
        return {
            templateUrl: '/modules/addresses/views/address.client.template.html',
            restrict: 'E',
            scope: {
                address: '=model',
                isEditing: '=?', // boolean
                canEdit: '=?',
                canRemove: '&?',
                remove: '&?',
                addressCount: '='
            },
            controller: 'OsAddressItemController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('addresses')
        .directive('osAddress', AddressItemDirective)
        .controller('OsAddressItemController', AddressItemController);

    AddressItemController.$inject = ['$uibModal'];
    function AddressItemController($uibModal) {

        var vm = this;

        vm.canEdit = !!this.canEdit; // Default to _false_ if undefined
        vm.canRemove = vm.canRemove || function() { return vm.canEdit; };
        vm.isOpen = false;

        function activate() {
            if (!!vm.address) {
                vm.typeVal = vm.address.type === 'other' ? (vm.address.typeOther || vm.address.type) : vm.address.type;
            }
        }

        vm.getAddressType = function() {
            if(vm.address.type === 'other') {
                return vm.address.typeOther;
            }

            return vm.address.type || 'address';
        };

        vm.editAddress = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'addressEditModal.html',
                controllerAs: 'vm',
                controller: function($scope,  address, text) {
                    debugger;
                    var vm = this;
                    vm.address = address;
                    vm.text = text;

                    $scope.vm = vm;
                },
                resolve: {
                    address: function() {
                        return vm.address;
                    },
                    text: function() {
                        return { submit : 'Save' };
                    }
                }
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

        vm.removeAddress = function() {
            if(!!vm.remove) {
                vm.remove(vm.address);
            } else {
                debugger;
                vm.address = null;
            }
        };

        activate();
    }

})();
