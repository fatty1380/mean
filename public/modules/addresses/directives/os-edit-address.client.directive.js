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
            }
        };
    }
])

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
    .controller('OsAddressListController', [function() {
        //this.enableEdit = this.enableEdit === undefined ? false : this.enableEdit.enable || this.enableEdit;
    }]);
