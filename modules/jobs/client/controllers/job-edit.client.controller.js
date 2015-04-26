(function () {
    'use strict';

    // Jobs controller
    function JobEditController($stateParams, $state, $log, Authentication, Jobs, job, company, $modal) {

        if(!Authentication.user) {
            return $state.go('intro');
        }

        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        // Bound Objects
        vm.job = job;
        vm.company = company || job && typeof job.company === 'object' && job.company || undefined;


        if (typeof vm.user.company === 'string' && vm.user.company !== (vm.company && vm.company._id)) {
            return $state.go('home');
        }
        else if (typeof vm.user.company === 'object' &&  vm.user.company._id === (vm.company && vm.company._id)) {
            return $state.go('home');
        }

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

                if (!vm.company.subscription) {
                    vm.invalidSubscription = 'Sorry, but you will need to purchase a subscription before posting jobs';
                } else if (!vm.company.subscription.isValid) {
                    vm.invalidSubscription = vm.company.subscription.statusMessage;
                }

                if (!vm.company.subscription || !vm.company.subscription.isValid) {
                    openSubscriptionModal();
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

        function openSubscriptionModal() {
            var modalInstance = $modal.open({
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
            }, function (errorResponse) {
                if (!!errorResponse.data.message) {
                    vm.error = errorResponse.data.message;
                }
                else {
                    debugger;
                    vm.error = 'Unable to save changes at this time';
                    $log.error('[JobEditCtrl] Error Saving New Job: %o', job, errorResponse);
                }
                vm.disabled=false;
            });

            // Clear form fields
            // TODO: Clear all form fields
            ///this.name = '';
        }

        // Update existing Job

        function update() {
            var job = vm.job;

            job.$update(function (response) {
                $state.go('jobs.view', {jobId: response._id});
            }, function (errorResponse) {
                if (!!errorResponse.data.message) {
                    vm.error = errorResponse.data.message;
                }
                else {
                    debugger;
                    vm.error = 'Unable to save changes at this time';
                    $log.error('[JobEditCtrl] Error Saving New Job: %o', job, errorResponse);
                }
                vm.disabled=false;
            });
        }

        activate();
    }


    JobEditController.$inject = ['$stateParams', '$state', '$log', 'Authentication', 'Jobs', 'job', 'company', '$modal'];

    angular.module('jobs')
        .controller('JobEditController', JobEditController);

})();
