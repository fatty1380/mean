(function () {
    'use strict';

    // Jobs controller
    function JobEditController($stateParams, $state, $log, Authentication, Jobs, job, company) {

        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        // Bindable Functions:
        vm.cancel = cancel;
        vm.submit = submit;
        vm.create = create;
        vm.update = update;

        // Page Display Bindings
        vm.enableEdit = false;
        vm.showPreview = false;

        // Bound Objects
        vm.job = job;
        vm.company = company || job && typeof job.company === 'object' && job.company || undefined;

        var defaultAddress = {type: 'main', streetAddresses: [], zipOnly: true};
        vm.types = ['main', 'home', 'business', 'billing', 'other'];
        vm.pageTitle = 'Edit Job';
        vm.requirements = '<ul><li></li></ul>';

        activate();

        function activate() {
            if ($state.is('jobs.create')) {
                vm.pageTitle = 'Post new job';

                if (!vm.company) {
                    $log.error('[JobEditCtrl] Company must be defined when posting a new job, returning home');
                    $state.go('home');
                }

                vm.job = {
                    payRate: {
                        min: null,
                        max: null
                    },
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

                vm.requirements = '<ul><li>' + (vm.job.requirements || []).join('</li><li>') + '</li></ul>';
            }



        }

        // Method Implementations
        function cancel() {
            // TODO: add change tracking and confirmation
            $state.go('jobs.view', {jobId: vm.job._id});
        }

        var reg = /<li>(.*?)<\/li>/ig;

        function submit() {

            vm.job.requirements = [];
            var result, i=0;
            while(!!(result = reg.exec(vm.requirements)) && i<100) {
                $log.debug('Matched requirement #%d: \'%o\'', ++i, result[1]);
                vm.job.requirements.push(result[1]);
            }

            if ($state.is('jobs.create')) {
                return vm.create();
            }
            if ($state.is('jobs.edit')) {
                return vm.update();
            }

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
            });
        }
    }


    JobEditController.$inject = ['$stateParams', '$state', '$log', 'Authentication', 'Jobs', 'job', 'company'];

    angular.module('jobs')
        .controller('JobEditController', JobEditController);

})();
