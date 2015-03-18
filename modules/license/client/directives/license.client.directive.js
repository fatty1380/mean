(function () {
    'use strict';

    function EditLicenseController($scope, $log, appConfig) {
        var vm = this;

        vm.licenseTypes = ['Standard', 'Commercial'];
        vm.ratings = ['A', 'B', 'C', 'D', 'G'];
        vm.endorsements = [
            {key: 'HME', description: 'Hazardous Materials', value: false},
            {key: 'P', description: 'Passenger', value: false},
            {key: 'S', description: 'School Bus', value: false},
            {key: 'T', description: 'Double-Triple Trailer', value: false},
            {key: 'N', description: 'Tank Vehicle', value: false},
            {key: 'M', description: 'Motorcycle', value: false}
        ];

        if (_.isEmpty(vm.license)) {
            $log.warn('[EditLicense] Assuming we are creating a new license. Is this OK?');
        } else {
            $log.debug('[EditLicense] Displaying License for editing: %o', vm.license);
        }

        vm.mode = vm.mode || 'standard';

        if (vm.mode === 'minimal') {
            vm.view = {
                cols: 1,
                horizontal: true,
                types: true,
                classes: true,
                hideClasses: false,
                state: false,
                expires: false,
                dob: false,
                endorsements: false
            };
        } else {
            // 'Standard' View
            vm.view = {
                cols: 2,
                horizontal: false,
                types: true,
                classes: true,
                hideClasses: false,
                state: true,
                expires: true,
                dob: true,
                endorsements: true
            };
        }

        vm.states = appConfig.getStates();
        vm.debug = appConfig.get('debug');

        vm.dateFormat = 'MM/DD/YYYY';
    }

    function EditLicenseDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/license/views/license.client.template.html',
            restrict: 'E',
            scope: {
                license: '=?model',
                user: '=?',
                mode: '@?'
            },
            controller: 'EditLicenseController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function InlineLicenseDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/license/views/license-inline.client.template.html',
            restrict: 'E',
            scope: {
                license: '=model',
                showEndorsements: '=?'
            },
            controller: function() {
                var vm=this;
                vm.showEndorsements = !!vm.showEndorsements;
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    EditLicenseController.$inject = ['$scope', '$log', 'AppConfig'];

    angular.module('license')
        .controller('EditLicenseController', EditLicenseController)
        .directive('osetLicenseInline', InlineLicenseDirective)
        .directive('osEditLicense', EditLicenseDirective);

})
();
