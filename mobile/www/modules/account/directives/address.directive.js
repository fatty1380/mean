(function () {
    'use strict';

    angular
        .module('account')
        .directive('osetEditAddress', osetAddress);

    osetAddress.$inject = [];
    function osetAddress() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            template: tpl,
            bindToController: true,
            controller: ControllerController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            scope: {
                address: '=ngModel'
            }
        };

        return directive;

        function link(scope, element, attrs) {

        }
    }


    var tpl = '<div class="item item-input"> ' +
        '<input type="text" name="addrLine1" ng-model="vm.address.streetAddresses[0]" placeholder="Street Address"> ' +
        '</div>' +
        '<div class="item item-input">' +
        '<input type="text" name="addrLine2" ng-model="vm.address.streetAddresses[1]" placeholder="Line 2 (optional)">' +
        '</div>' +
        '<div class="item item-input">' +
        '<input type="text" name="addrCity" ng-model="vm.address.city" placeholder="City">' +
        '</div>' +
        '<div class="item item-input">' +
        '<input type="text" name="addrState" ng-model="vm.address.state" placeholder="State">' +
        '</div>' +
        '<div class="item item-input">' +
        '<input type="tel" name="addrZip" ng-model="vm.address.zipCode" placeholder="Zip">' +
        '</div>';
            
    /* @ngInject */
    function ControllerController() {
        var vm = this;


    }
})();