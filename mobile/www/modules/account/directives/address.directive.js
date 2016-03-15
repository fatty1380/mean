(function () {
    'use strict';

    angular
        .module('account')
        .directive('tlineAddressToggle', tlineAddressToggle);

    function tlineAddressToggle () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            template: toggleTemplate,
            controller: StubCtrl,
            bindToController: true,
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                address: '=ngModel',
                isEditing: '=editMode'
            }
        };

        return directive;
    }

    var toggleTemplate =
        '<tline-address ng-if="!vm.isEditing" ng-model="vm.address"></tline-address>' +
        '<tline-address-edit ng-if="!!vm.isEditing" ng-model="vm.address"></tline-address-edit>';

    angular
        .module('account')
        .directive('tlineAddressEdit', tlineAddressEdit);

    function tlineAddressEdit () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            template: editTemplate,
            controller: AddrCtrl,
            bindToController: true,
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                address: '=ngModel'
            }
        };

        return directive;
    }

    var editTemplate = '<div class="item item-input"> ' +
        '<input type="text" name="addrLine1" ng-model="vm.address.streetAddresses[0]" placeholder="Street Address"> ' +
        '</div>' +
        '<div class="item item-input">' +
        '<input type="text" name="addrLine2" ng-model="vm.address.streetAddresses[1]" placeholder="Line 2 (optional)">' +
        '</div>' +
        '<div class="item item-input">' +
        '<ion-label>City</ion-label>' +
        '<input type="text" name="addrCity" ng-model="vm.address.city" placeholder="City">' +
        '</div>' +
        '<div class="item item-select ">' +
        '<ion-label>State</ion-label>' +
        '<select name="addrState" ng-options="state as state.name for state in vm.states" ng-model="vm.state" ng-change="vm.select()"></select>' +
        '</div>' +
        '<div class="item item-input">' +
        '<ion-label>ZIP</ion-label>' +
        '<input type="tel" name="addrZip" ng-model="vm.address.zipCode" placeholder="Zip">' +
        '</div>';




    angular
        .module('account')
        .directive('tlineAddress', tlineAddress);

    function tlineAddress () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            template: viewTemplate,
            controller: StubCtrl,
            bindToController: true,
            controllerAs: 'vm',
            restrict: 'E',
            scope: {
                address: '=ngModel'
            }
        };

        return directive;
    }


    var viewTemplate = '<span ng-bind="vm.address.streetAddresses[0]"></span><br>' +
                        '<span ng-if="!!vm.address.streetAddresses[1]">' +
                            '{{vm.address.streetAddresses[1]}}<br>' +
                        '</span>' +
                        '<span ng-bind="vm.address.city"></span>' +
                        '<span ng-bind="vm.address.state"></span>' +
        '<span ng-bind="vm.address.zipCode"></span>';


    function StubCtrl () {
        var vm = this;
    }

    function AddrCtrl ($http, settings, API) {
        var vm = this;
        vm.select = select;
        vm.states = vm.states || null;
        
        initialize();        
        ////////////////////
        function initialize(){
            return getStates();
        }
        
        function select() {
            if (vm.state) {
                vm.address.state = vm.state['alpha-2'];
            }
        }
        
        function getStates () {
            return API.doRequest(settings.stateAddress, 'GET')
                .then(function success(states) {
                    vm.states = states.data;
                    return vm.states;
                })
                .catch(function fail(err) {
                    logger.error('Failed to retrieve list of states', err);
                    vm.states = null; 
                    return vm.states;
                });
        }
    }
})();
