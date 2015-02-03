(function () {
    'use strict';

    /* @ngInject */
    function NewApplicationDirective() {
        // Usage:
        //
        // Creates:
        //
        var ddo;
        ddo = {
            transclude: true,
            templateUrl: 'modules/jobs/views/templates/os-new-application-modal.client.template.html',
            restrict: 'EA',
            scope: {
                job: '=',
                title: '@?'
            },
            controller: 'NewApplicationModalController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function NewApplicationModalController($modal, $log) {

        var vm = this;

        vm.isOpen = false;

        vm.showModal = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'applyModal.html',
                controller: 'ApplicationCreateController', // Pass data here?
                controllerAs: 'vm',
                size: size || 'lg',
                resolve: {
                    job: function () {
                        return vm.job;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $log.info('Modal result %o', result);
                vm.selected = result;
            }, function (result) {
                $log.info('Modal result %o', result);
                $log.info('Modal dismissed at: ' + new Date());
            });

            modalInstance.opened.then(function (args) {
                $log.info('Applying to Job Modal Args: %o', args);
                vm.isOpen = true;
            });
        };
    }

    function ApplicationCreateController($scope, $modalInstance, $state, $log, Applications, job) {

        var vm = this;
        $scope.vm = vm;

        // Bindable Members _____________________________________________________________
        vm.createApplication = createApplication;
        vm.saveDraft = saveDraft;

        // Bindable Variables ___________________________________________________________
        vm.job = job;
        vm.application = {};
        vm.placeholders = {
            title: 'Cover Letter for Job Application',
            messageHeading: '',
            messageSubHeading: 'This will serve as your introduction to the employer. Your application will  also consist of your completed profile, your resume and any reports you have ordered through Outset.',
            intro: 'Write a short message explaining why you\'re a good fit for the position.',
            errors: {
                noJob: 'You must select a job to apply to first, or you can save as a draft',
                noMessage: 'Please enter a message to the employer before submitting your application',
                terms: 'You must accept the terms before submitting your application'
            },
            disclaimer: '<strong>Terms:</strong> By Applying for this job you consent to this employer reviewing your personal information, including: Your Profile, Resume, Background Check, Motor Vehicle Report & Drug Test, (If items are present in your profile). Outset is not responsible for the hiring decision of this employer, any and all hiring actions, including rejection of applicant, are the responsibility of the employer and the applicant.'
        };

        // Implementation _______________________________________________________________

        // Create new Application
        function createApplication() {

            if(validateApplication(true)) {

                $log.debug('[AppController.create]', 'Creating new Application');
                // Create new Application object
                var application = new Applications.ByJob({
                    status: 'submitted',
                    agreement: vm.application.termsAccepted

                });

                saveApplication(application);
            }
        }

        function saveDraft() {
            if (validateApplication(false)) {

                $log.debug('[AppController.saveDraft]', 'Creating new Draft Application');
                // Create new Application object
                var application = new Applications.ById({
                    status: 'draft'
                });

                saveApplication(application);
            }
        }

        var validateApplication = function (termsRequired) {

            if (!vm.job || !vm.job._id) {
                vm.error = vm.placeholders.errors.noJob;
                return false;
            }

            if (termsRequired && !vm.application.termsAccepted) {
                vm.error = vm.placeholders.errors.terms;
                return false;
            }

            if (vm.applicantForm.$invalid) {
                if (!vm.application.message) {
                    vm.error = vm.placeholders.errors.noMessage;
                }
                else {
                    vm.error = 'Please correct the errors above in order to submit your application';
                }

                return false;
            }

            return true;
        };

        var saveApplication = function (application) {
            application.jobId = vm.job && vm.job._id && (vm.job._id);
            application.introduction = vm.application.message;
            application.agreement = vm.application.termsAccepted;

            // Redirect after save
            application.$save(function (response) {
                // Clear form fields

                $modalInstance.close(response._id);
                $state.go('applications.view', {applicationId: response._id});
            }, function (errorResponse) {
                vm.error = errorResponse.data.message;
            });
        };
    }

    NewApplicationModalController.$inject = ['$modal', '$log'];
    ApplicationCreateController.$inject = ['$scope', '$modalInstance', '$state', '$log', 'Applications', 'job'];

    angular
        .module('jobs')
        .directive('osNewApplicationModal', NewApplicationDirective)
        .controller('NewApplicationModalController', NewApplicationModalController)
        .controller('ApplicationCreateController', ApplicationCreateController);
})();
