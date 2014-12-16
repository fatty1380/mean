(function () {
    'use strict';

    /* @ngInject */
    function NewApplicationDirective() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
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

        return directive;
    }

    function NewApplicationModalController($modal, $log) {

        var vm = this;

        vm.isOpen = false;
        vm.placeholders = {intro: 'yo mama\'s so fat, she needs 64 bits of addressable space', title: 'shit dawg'};

        vm.yo = function () {
            debugger;
            $log.debug('sup! new app modal controller');
        }

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

        vm.yo = function () {
            debugger;
            $log.debug('sup! app create controller');
        }

        // Bindable Variables ___________________________________________________________
        vm.job = job;
        vm.placeholders = {
            intro: 'Write a short message explaining why you\'re a good fit for the position.',
            errors: {
                noJob: 'You must select a job to apply to first, or you can save as a draft',
                noMessage: 'Please enter a message before submitting your application'
            },
            title: 'New job application'
        };

        // Implementation _______________________________________________________________

        // Create new Application
        function createApplication() {

            if (!vm.job || !vm.job._id) {
                vm.error = vm.placeholders.errors.noJob;
                return;
            }

            $log.debug('[AppController.create]', 'Creating new Application');
            // Create new Application object
            var application = new Applications.ByJob({
                status: 'submitted'
            });

            saveApplication(application);
        };

        function saveDraft() {
            $log.debug('[AppController.saveDraft]', 'Creating new Draft Application');
            // Create new Application object
            var application = new Applications.ById({
                status: 'draft'
            });

            saveApplication(application);
        };

        var saveApplication = function (application) {
            if (!vm.message || vm.message.length < 1) {
                vm.error = vm.placeholders.errors.noMessage;
                return;
            }

            application.jobId = vm.job && vm.job._id && (vm.job._id);
            application.messages = [{
                text: vm.message,
                status: 'sent'
            }];

            // Redirect after save
            application.$save(function (response) {
                // Clear form fields
                vm.message = '';
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
