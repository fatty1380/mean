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

                    if (vm.model.isNew) {
                        vm.labelClass = 'label-primary';
                        vm.labelText = 'unreviewed';
                    } else if (vm.model.isConnected) {
                        if (vm.model.connection.isValid && vm.model.connection.remainingDays >= 5) {
                            vm.labelClass = 'label-success';
                            vm.labelText = 'connected';
                        }
                        else if (vm.model.connection.isValid && vm.model.connection.remainingDays < 5) {
                            vm.labelClass = 'label-warning';
                            vm.labelText = 'expires-soon';
                        } else if (!vm.model.connection.isValid) {
                            vm.labelClass = 'label-danger';
                            vm.labelText = 'expired';
                        }
                    } else if (vm.model.isRejected) {
                        vm.labelClass = 'label-danger';
                        vm.labelText = vm.model.status;
                    }
                    else if(vm.model.status === 'read') {
                        vm.labelClass = 'label-default';
                        vm.labelText = 'reviewed';
                    }

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
