'use strict';

angular.module('addresses')

.directive('osEditAddress', [
        function() {
            return {
                templateUrl: 'modules/addresses/views/edit-address.client.template.html',
                restrict: 'E',
                scope: {
                    address: '=',
                    enableEdit: '=' // boolean
                },
                controller: 'OsEditAddressController',
                controllerAs: 'editCtrl',
                bindToController: true
            };
        }
    ])
    .controller('OsEditAddressController', [function() {
        this.types = ['main', 'home', 'business', 'billing', 'other'];

        if (!this.address.streetAddresses) {
            this.address.streetAddresses = [];
        }
        while (this.address.streetAddresses.length < 2) {
            this.address.streetAddresses.push('');
        }
    }])

.directive('osAddress', [
        function() {
            return {
                templateUrl: 'modules/addresses/views/address.client.template.html',
                restrict: 'E',
                scope: {
                    address: '=',
                    enableEdit: '=' // boolean
                },
                controller: 'OsAddressItemController',
                controllerAs: 'viewCtrl',
                bindToController: true
            };
        }
    ])
    .controller('OsAddressItemController', ['$modal', function($modal) {
        if (this.address.uninitalized) {
            alert('Holy Moly!');
        }

        this.editAddress = function() {
            debugger;
            var modalInstance = $modal.open({
                templateUrl: 'addressEditModal.html',
                controllerAs: 'modalCtrl'
            });

            modalInstance.result.then(function(result) {
                console.log('Modal result %o', result);
                this.isOpen = false;
            }, function(result) {
                console.log('Modal dismissed at: ' + new Date());
                this.isOpen = false;
            });

            modalInstance.opened.then(function(args) {
                this.isOpen = true;
            });

        };

    }])

.directive('osAddressList', [
        function() {
            return {
                templateUrl: 'modules/addresses/views/address-list.client.template.html',
                restrict: 'E',
                scope: {
                    addresses: '=',
                    enableEdit: '=?' // boolean
                },
                controller: 'OsAddressListController',
                controllerAs: 'listCtrl',
                bindToController: true
            };
        }
    ])
    .controller('OsAddressListController', ['Addresses', function(Address) {
        this.addAddress = function() {
            // Prevent this from bubbling up;
            event.preventDefault();

            var addr = new Address({
                type: 'select type',
                streetAddresses: ['', ''],
                uninitalized: true
            });

            this.addresses.push(addr);
        };

        this.removeAddress = function(address) {
            if (address) {
                for (var i in this.addresses) {
                    if (this.addresses[i] === address) {
                        this.addresses.splice(i, 1);
                    }
                }
            }
        };

    }]);
