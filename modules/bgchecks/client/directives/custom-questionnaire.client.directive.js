(function () {
    'use strict';

    var QuestionnaireController = function (Reports, Applicants, Authentication, Gateway, $log, $q, $state, $stateParams) {
        var vm = this;

        vm.readOnly = JSON.parse($stateParams.readonly);

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

        vm.methods.init = function () {

            Gateway.user.then(function (user) {
                vm.user = user;
            });
            Gateway.report.then(function (reportResponse) {
                vm.report = reportResponse;
            });
            Gateway.applicant.then(function (applicantResponse) {
                vm.applicant = applicantResponse;

                if (!!vm.readOnly && _.isEmpty(vm.applicant)) {
                    debugger;
                    $state.go($state.current.name, {readonly: false});
                }
            });

            vm.reportLoad = $q.defer();
            vm.loading = vm.reportLoad.promise;

            $q.all({report: Gateway.report, applicant: Gateway.applicant})
                .then(function (result) {
                    debugger;
                    vm.reportLoad.resolve({report: result.report, applicant: result.applicant});
                });
        };

        vm.methods.submit = function () {
            if (!vm.readOnly) {
                $log.debug('Submit only done from validation page');
                return true;
            }

            vm.disabled = vm.creating = true;
            vm.error = vm.success = null;

            //vm.showSpinner();

            var applicantRsrc = new Applicants.FromForm(vm.applicant, vm.user._id);

            $log.debug('Creating new applicant Rsrc with data: %o', applicantRsrc);

            debugger;
            return applicantRsrc.$save().then(
                function (response) {
                    if (response.updated) {
                        $log.debug('Successfully updated existing applicant: %j', response);
                    }
                    else {
                        $log.debug('SUCCESS! Created new Applicant: %o', response);
                    }

                    vm.success = 'Applicant data has been verified on the server!';
                    vm.error = null;

                    //$state.go('reportpayments', {'sku': vm.report.sku});
                    //
                    //vm.spinnerModal.dismiss('done');
                    return response;

                })
                .catch(function (err) {
                    if (err) {
                        $log.error('failed to create applicant: %o', err);

                    }
                    //vm.spinnerModal.dismiss('done');

                    vm.error = 'Sorry, but something went wrong trying to create your report applicant. Please try again later';

                    vm.disabled = false;
                    vm.error = err.message || err.data && err.data.message;
                    return $q.reject(vm.error);
                });

        };

        vm.methods.init();
    };

    QuestionnaireController.$inject = ['Reports', 'Applicants', 'Authentication', 'Gateway', '$log', '$q', '$state', '$stateParams'];

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
        .directive('osetCustomQuestionForm', CustomQuestionnaireDirective);
})();
