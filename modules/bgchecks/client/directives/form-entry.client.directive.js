(function () {
    'use strict';

    var FormEntryController = function (PolyField, $q) {
        var vm = this;

        vm.debug = true;
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
                vm.initialize(values[0], values[1]);
            });
        }
        else {
            vm.initialize();
        }
    };

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

    FormEntryController.$inject = ['PolyFieldService'];

    var QuestionnaireController = function (Reports, Applicants, Authentication, $log, $q, $state, $stateParams) {
        var vm = this;

        vm.readOnly = JSON.parse($stateParams.readonly);
        vm.formData = $state.current.data.formData;

        var sku = 'OUTSET_MVR';
        var userId = Authentication.user._id;
        var getApplicant = !!vm.model ? $q.when(vm.model) : Applicants.ByUser.get({userId: userId}).$promise;

        vm.loading = $q.all([Reports.get(sku).$promise, getApplicant]);

        vm.loading.catch(function (error) {
            if (error.status === 404) {
                console.log('No Existing Applicant for User');
                return null;
            }

            console.error('Hard error %s searching for applicant: %o', error.status, error);
            return $q.reject(error);
        });

        vm.methods.validate = function () {
            vm.form.$setSubmitted();

            debugger;
            if (vm.form.$invalid) {

                _.map(_.keys(vm.form.$error), function (errorType) {
                    $log.warn('[SignupApply.validateForm] Form %d has error type: %s', vm.currentStep, errorType);
                    _.map(vm.form.$error[errorType], function (item) {
                        $log.error('[SignupApply.validateForm] %s has error: %o', item.$name, item);
                        if (!!item) {
                            item.$setDirty(true);
                        }
                    });
                });
                return $q.reject('Please correct the errors above');
            }

            return $q.when('Questionnaire Form is valid');
        };
    };

    QuestionnaireController.$inject = ['Reports', 'Applicants', 'Authentication', '$log', '$q', '$state', '$stateParams'];

    var CustomQuestionnaireDirective = function () {
        var ddo = {
            restrict: 'E',
            templateUrl: '/modules/bgchecks/views/templates/custom-questionnaire.client.template.html',
            require: ['^form'],
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            },
            scope: {
                model: '=?',     // Model to save, eg: Applicant
                report: '=?', // Source of questions, eg: Report Definition
                methods: '=?'     // Methods for interacting with validation from the parent form
            },
            controller: 'QuestionnaireController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    };

    angular.module('bgchecks')
        .controller('QuestionnaireController', QuestionnaireController)
        .directive('osetCustomQuestionForm', CustomQuestionnaireDirective)
        .controller('FormEntryController', FormEntryController)
        .directive('osetFormEntry', FormEntryDirective);
})();
