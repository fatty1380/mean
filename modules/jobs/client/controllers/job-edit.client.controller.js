(function () {
    'use strict';

    angular.module('jobs')
        .controller('JobEditController', JobEditController);

    // Jobs controller
    JobEditController.$inject = ['$stateParams', '$state', '$log', 'Authentication', 'Jobs', 'job', 'company', '$uibModal', 'AppConfig'];
    function JobEditController($stateParams, $state, $log, Authentication, Jobs, job, company, $uibModal, config) {

        if(!Authentication.user) {
            return $state.go('intro');
        }

        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        // Bound Objects
        vm.job = job;
        vm.company = company || job && typeof job.company === 'object' && job.company || undefined;

        // Bindable Functions:
        vm.cancel = cancel;
        vm.submit = submit;
        vm.create = create;
        vm.update = update;

        // Page Display Bindings
        vm.enableEdit = false;
        vm.showPreview = false;

        var defaultAddress = {type: 'main', streetAddresses: [], zipOnly: true};
        vm.types = ['main', 'home', 'business', 'billing', 'other'];
        vm.pageTitle = 'Edit Job';

        function activate() {
            if ($state.is('jobs.create')) {
                vm.pageTitle = 'Post new job';

                if (!vm.company) {
                    $log.error('[JobEditCtrl] Company must be defined when posting a new job, returning home');
                    $state.go('home');
                }

                if(config.requireSubscription) {
                    checkSubscription();
                }

                vm.job = {
                    payRate: {
                        min: null,
                        max: null
                    },
                    requirements: '<ul><li></li></ul>',
                    location: [defaultAddress],
                    postStatus: 'draft',
                    companyId: !!vm.company && vm.company._id || $stateParams.companyId
                };
            }
            else if ($state.is('jobs.edit')) {
                if (!vm.job.location) {
                    vm.job.location = [];
                }

                if (vm.job.location.length === 0) {
                    vm.job.location.push(defaultAddress);
                }
            }
        }

        function checkSubscription() {
            if (!vm.company.subscription) {
                vm.invalidSubscription = 'Sorry, but you will need to purchase a subscription before posting jobs';
            } else if (!vm.company.subscription.isValid) {
                vm.invalidSubscription = vm.company.subscription.statusMessage;
            }

            if (!vm.company.subscription || !vm.company.subscription.isValid) {
                openSubscriptionModal();
            }
        }

        function openSubscriptionModal() {
            var modalInstance = $uibModal.open({
                templateUrl: 'invalidSubscription.html',
                controller: ['$state', '$modalInstance', 'statusMessage',
                    function ($state, $modalInstance, statusMessage) {
                        var vm = this;

                        vm.statusMessage = statusMessage;

                        vm.gotoPlans = function () {
                            $state.go('subscriptionsReview');
                            $modalInstance.close('subscriptions');
                        };

                        vm.cancel = function () {
                            $state.go('home');
                            $modalInstance.close('home');
                        };
                    }],
                backdrop: true,
                backdropClass: 'shadow',
                controllerAs: 'vm',
                size: 'lg',
                keyboard: false,
                resolve: {
                    statusMessage: function () {
                        return vm.invalidSubscription;
                    }
                }
            });

            modalInstance.result.then(function (message) {
                $log.info('Modal accepted with message: %s', message);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
                $state.go('home');
            });
        }

        // Method Implementations
        function cancel() {
            // TODO: add change tracking and confirmation
            $state.go('jobs.view', {jobId: vm.job._id});
        }

        function submit() {
            vm.disabled = true;

            if(vm.jobForm.$invalid) {
                if(vm.jobForm.$error.required) {
                    vm.error = 'Please fill in all required fields above';
                } else {
                    vm.error = 'Please correct all errors above';
                }
                vm.disabled = false;
                return false;
            }
            vm.error = vm.success = null;

            if ($state.is('jobs.create')) {
                return vm.create();
            }
            if ($state.is('jobs.edit')) {
                return vm.update();
            }

            vm.disabled=false;
            $log.warn('Unknown Form Mode: "%s"', vm.mode);
            vm.error = 'Unknown Form Mode';
        }

        // Create new Job
        function create() {

            debugger; // todo - check companyId status
            vm.job.companyId = vm.job.companyId || vm.company._id;

            if (!vm.job.companyId) {
                $log.error('Cannot create a job without a company ID!');
                vm.error = 'Company is not defined, please try again later';
                return;
            }

            // Create new Job object
            var job = new Jobs.ById(vm.job);

            // Redirect after save
            job.$save(function (response) {
                $state.go('jobs.view', {jobId: response._id});
            }, handleErr );
        }

        // Update existing Job

        function update() {
            var job = vm.job;

            job.$update(function (response) {
                $state.go('jobs.view', {jobId: response._id});
            }, handleErr);
        }

        function handleErr(errorResponse) {
            if (!!errorResponse.data && errorResponse.data.message) {
                vm.error = errorResponse.data.message;
            }
            else {
                debugger;
                vm.error = 'Unable to save changes at this time';
                $log.error('[JobEditCtrl] Error Saving Job: %o', job, errorResponse);
            }
            vm.disabled=false;
        }

        activate();
    }

})();
