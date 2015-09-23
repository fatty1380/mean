(function () {
    'use strict';

    function ApplicationStatusBadgeDirective() {
        var ddo;

        ddo = {
            template: '<span class="label {{vm.labelClass}}">{{ vm.labelText | uppercase }}</span>',
            restrict: 'E',
            scope: true,
            require: 'ngModel',
            link            : function (scope, element, attrs, ngModel) {
                var vm = scope.vm;
                if (!!ngModel) {
                    scope.$watch(function () {
                        return ngModel.$modelValue;
                    }, function (newValue) {
                        vm.labelClass = vm.getLabelClass(newValue);
                        vm.labelText = newValue.statusCat;
                    });

                    scope.vm.application = ngModel.$modelValue;
                } else {
                    debugger;
                }
            },
            controller: function () {
                var vm = this;

                vm.labelClass = 'label-default';
                vm.labelText = 'unknown';

                vm.getText = function(val) {
                    return !!val ? val.statusCat : 'view now';
                };

                vm.getLabelClass = function(val) {
                    var cnxn = val.connection;

                    if (val.isUnreviewed) {
                        vm.labelClass = 'label-primary';
                    } else if (val.isConnected) {
                        if (cnxn.isValid && (!cnxn.expires || cnxn.remainingDays >= 5)) {
                            vm.labelClass = 'label-success';
                        }
                        else if (cnxn.isValid && (cnxn.expires && cnxn.remainingDays < 5)) {
                            vm.labelClass = 'label-warning';
                            vm.labelText = 'expires-soon';
                        } else if (!cnxn.isValid) {
                            vm.labelClass = 'label-danger';
                        }
                    } else if (val.isRejected) {
                        vm.labelClass = 'label-danger';
                    }
                    else if(val.status === 'read') {
                        vm.labelClass = 'label-default';
                    }
                };
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('applications')
        .directive('osApplicationStatusBadge', ApplicationStatusBadgeDirective);

})();
