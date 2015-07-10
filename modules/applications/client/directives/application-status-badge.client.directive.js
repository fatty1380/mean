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

                vm.labelClass = 'label-default';

                if (!!vm.model) {

                    vm.labelText = vm.model.statusCat;
                    var cnxn = vm.model.connection;

                    if (vm.model.isUnreviewed) {
                        vm.labelClass = 'label-primary';
                    } else if (vm.model.isConnected) {
                        if (cnxn.isValid && (!cnxn.expires || cnxn.remainingDays >= 5)) {
                            vm.labelClass = 'label-success';
                        }
                        else if (cnxn.isValid && (cnxn.expires && cnxn.remainingDays < 5)) {
                            vm.labelClass = 'label-warning';
                            vm.labelText = 'expires-soon';
                        } else if (!cnxn.isValid) {
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
