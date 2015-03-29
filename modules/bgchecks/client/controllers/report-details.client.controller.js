(function () {
    'use strict';

    function ReportDetailsController(report, applicant, appConfig, auth, Applicants, $log, $state, $modal, $document, PolyField) {
        var vm = this;

        vm.debugMode = appConfig.get('debug');


        vm.report = report;
        vm.applicant = applicant || {};
        vm.config = appConfig;

        vm.verify = false;
        vm.pay = false;

        vm.introText = 'All reports are run by leading verification company, eEverifile. Outset will never store your Social Security , Driver License or Credit Card numbers.';
        vm.getStartedText = 'All required fields are <b>Marked in Bold</b>';
        vm.correctErrorsText = 'Please review any answers that are <span class="cta-outline">marked in red</span> below.';
        vm.reviewText = 'Please review your information and click continue at the bottom of the page when ready.';
        vm.createText = 'Please review your information and click continue when ready. Please note, that this may take a moment to complete.';
        vm.payExplanation = 'Please click continue to enter your payment information';


        vm.states = null;
        vm.countries = null;

        function activate() {
            vm.price = vm.report.promo || vm.report.price;

            PolyField.completeModel(vm.report.fields, vm.applicant);
            PolyField.translateFields(vm.report.fields, vm.applicant);
        }

        /**
         * Handles the initial applicant creation & update
         * After return, either invalidates teh form (error),
         * Or sets the form into "verify" state
         * */
        vm.saveForm = function (event) {
            vm.disabled = true;

            $document.scrollTopAnimated(0, 300);

            if (vm.reportForm.$invalid) {
                vm.error = 'Please correct all errors above';
                vm.disabled = false;
                return false;
            }

            vm.error = vm.success = null;

            vm.disabled = vm.creating = false;
            vm.verify = true;

        };

        vm.submitApplicant = function (event) {
            vm.disabled = vm.creating = true;
            vm.error = vm.success = null;

            vm.showSpinner();

            var applicantRsrc = new Applicants.FromForm(vm.applicant, auth.user._id);

            $log.debug('Creating new applicant Rsrc with data: %o', applicantRsrc);

            applicantRsrc.$save(function (response) {

                if (response.updated) {
                    $log.debug('Successfully updated existing applicant: %j', response);
                }
                else {
                    $log.debug('SUCCESS! Created new Applicant: %o', response);
                }

                vm.success = 'Applicant data has been verified on the server!';
                vm.error = null;

                $state.go('reportpayments', {'sku': vm.report.sku});

                vm.spinnerModal.dismiss('done');

            }, function (err) {
                if (err) {
                    $log.error('failed to create applicant: %o', err);

                }
                vm.spinnerModal.dismiss('done');

                vm.error = 'Sorry, but something went wrong trying to create your report applicant. Please try again later';

                vm.disabled = false;
                vm.error = err.message || err.data && err.data.message;
                return false;
            });
        };

        vm.goBack = function () {
            vm.verify = vm.creating = vm.ispay = false;
            vm.success = vm.error = null;
        };

        vm.showSpinner = function () {
            vm.spinnerModal = $modal.open({
                templateUrl: 'spinnerModal.html',
                backdrop: 'static',
                controller: ['$timeout', function ($timeout) {
                    var vm = this;
                    vm.textStatuses = [
                        {text: 'Connecting to eVerifile', timeout: 1750},
                        {text: 'Validating Security', timeout: 1250},
                        {text: 'Confirming Identity', timeout: 2000},
                        {text: 'Storing Information', timeout: 10000},
                        {text: 'Finalizing Report Data', timeout: 1000}
                    ];

                    vm.uploadStatusText = vm.textStatuses[0].text;

                    vm.updateStatus = function (i) {
                        $timeout(function () {
                            i++;
                            if (i < vm.textStatuses.length) {
                                vm.uploadStatusText = vm.textStatuses[i].text;

                                vm.updateStatus(i);
                            }

                        }, vm.textStatuses[i].timeout);
                    };

                    vm.updateStatus(0);


                }],
                controllerAs: 'vm',
                bindToController: true
            });
        };

        activate();
    }

    ReportDetailsController.$inject = ['report', 'applicant', 'AppConfig', 'Authentication', 'Applicants', '$log', '$state', '$modal', '$document', 'PolyFieldService'];
    angular.module('bgchecks')
        .controller('ReportDetailsController', ReportDetailsController);

})();
