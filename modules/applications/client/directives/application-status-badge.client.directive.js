(function () {
    'use strict';

    function ApplicationStatusBadgeDirective() {
        var ddo;

        ddo = {
            template: '<span class="label {{vm.labelClass}}" ng-if="vm.model">{{ vm.labelText | uppercase }}</span>',
            restrict: 'E',
            scope: {
                model: '='
            },
            controller: function () {
                var vm = this;

                if (!!vm.model) {

                    vm.labelText = vm.model.statusCat;

                    if (vm.model.isNew) {
                        vm.labelClass = 'label-primary';
                    } else if (vm.model.isConnected) {
                        if (vm.model.connection.isValid && vm.model.connection.remainingDays >= 5) {
                            vm.labelClass = 'label-success';
                        }
                        else if (vm.model.connection.isValid && vm.model.connection.remainingDays < 5) {
                            vm.labelClass = 'label-warning';
                            vm.labelText = 'expires-soon';
                        } else if (!vm.model.connection.isValid) {
                            vm.labelClass = 'label-danger';
                        }
                    } else if (vm.model.isRejected) {
                        vm.labelClass = 'label-danger';
                    }
                    else if(vm.model.status === 'read') {
                        vm.labelClass = 'label-default';
                    }

                }
                else {
                    vm.labelText = 'view now';
                    vm.labelClass = 'label-default';
                }
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('applications')
        .directive('osApplicationStatusBadge', ApplicationStatusBadgeDirective);

})();
