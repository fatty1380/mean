(function () {
    'use strict';

    function FormEntryController(PolyField, $q) {
        var vm = this;

        vm.debug = false;
        vm.fields = [];

        vm.initialize = function (report, model) {
            report = report && report || vm.report || {};
            model = model || vm.model || {};

            var fields = report.fields;

            PolyField.completeModel(fields, model);
            PolyField.translateFields(fields, model);

            vm.model = model;
            vm.fields = fields;
        };



        if (!!vm.loading) {
            vm.loading.then(function (values) {
                debugger;
                vm.initialize(values.report, values.applicant);
            });
        }
        else {
            vm.initialize();
        }
    }

    FormEntryController.$inject = ['PolyFieldService', '$q'];

    var FormEntryDirective = function () {
        var ddo = {
            restrict: 'E',
            require: ['^form'],
            templateUrl: function (elem, attrs) {
                switch (attrs.mode) {
                    default:
                        return '/modules/bgchecks/views/templates/form-entry.client.template.html';
                }
            },
            scope: {
                model: '=',
                report: '=',
                loading: '=',
                readOnly: '='
            },
            controller: 'FormEntryController',
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            }
        };

        return ddo;
    };

    angular.module('bgchecks')
        .controller('FormEntryController', FormEntryController)
        .directive('osetFormEntry', FormEntryDirective);
})();
