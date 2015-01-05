(function () {
    'use strict';

    function EditLicenseController($scope, $log, ngModelController) {
        var vm = this;

        vm.ratings = ['A', 'B', 'C', 'D', 'G'];
        vm.endorsements = [{
            key: 'HME',
            description: 'Hazardous Materials',
            value: false
        }, {
            key: 'P',
            description: 'Passenger',
            value: false
        }, {
            key: 'S',
            description: 'School Bus',
            value: false
        }, {
            key: 'T',
            description: 'Double-Triple Trailer',
            value: false
        }, {
            key: 'N',
            description: 'Tank Vehicle',
            value: false
        }, {
            key: 'M',
            description: 'Motorcycle',
            value: false
        }];

        if (vm.model) {
            $log.debug('[EditLicense] Displaying License: %o', vm.model);
        } else {
            $log.warn('[EditLicense] Assuming we are creating a new license');

            vm.model = {};
        }

        vm.dateFormat = 'MM/DD/YYYY';
        vm.maskFormat = '99/99/9999';
        vm.parseFormat = 'MMDDYYYY';

        vm.shadow = {
            expires: vm.model.expires,
            dateOfBirth: vm.model.dateOfBirth
        };

        $scope.$watch('vm.shadow.expires', function (val) {
            $log.info('vm.model.expires, %o, %o', this, val);

            var m;

            if (!!val) {
                m = moment(val, vm.parseFormat);

                if (m.isValid()) {
                    vm.model.expires = m;
                }
            }

            vm.licenseForm.expires.$valid = !m || m.isValid();
        });

        $scope.$watch('vm.shadow.dateOfBirth', function (val) {
            $log.info('vm.model.dateOfBirth, %o, %o', this, val);

            var m;

            if (!!val) {
                m = moment(val, vm.parseFormat);

                if (m.isValid()) {
                    vm.model.dateOfBirth = m;
                }
            }

            vm.licenseForm.dob.$valid = !m || m.isValid();
        });
    }

    function EditLicenseDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/license/views/license.client.template.html',
            restrict: 'E',
            scope: {
                license: '=?model',
                user: '=?'
            },
            controller: 'EditLicenseController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    EditLicenseController.$inject = ['$scope', '$log'];

    angular.module('license')
        .controller('EditLicenseController', EditLicenseController)
        .directive('osEditLicense', EditLicenseDirective);

})
();
