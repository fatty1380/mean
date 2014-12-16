(function () {
    'use strict';

    // Jobs controller
    function JobViewController($scope, $stateParams, $location, $state, $modal, $log, Authentication, Jobs, Companies, job, jobs, company) {

        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        vm.enableEdit = false;

        vm.job = job;
        vm.company = company || job && typeof job.company === 'object' && job.company || undefined;

        // Init addressDetails for creation.
        vm.showAddressDetails = false;

        activate();

        function activate() {

            if (vm.user.type === 'driver') {
                vm.enableEdit = false;
            }
            else if (vm.user.type === 'owner') {
                vm.enableEdit = vm.user._id === (vm.company && (vm.company.owner._id || vm.company.owner));
            }

            $log.debug('[JobCtrl.activate] %s enableEdit: %o', vm.user.type, vm.enableEdit);

        }

        $log.debug('State Params: %o', $stateParams);

        vm.types = ['main', 'home', 'business', 'billing', 'other'];

        vm.showAddressDetails = function () {
            event.preventDefault();

            vm.showAddressDetails = true;
        };

        vm.delist = function (job) {
            job = job || vm.job;

            if (!job) {
                $log.debug('Cannot delist without a job');
            }

            job.delist(); // TODO: Implement this somewhere
        };

        // Remove existing Job
        vm.remove = function (job) {
            if (job) {
                job.$remove();

                for (var i in vm.jobs) {
                    if (vm.jobs[i] === job) {
                        vm.jobs.splice(i, 1);
                    }
                }
            } else {
                vm.job.$remove(function () {
                    $location.path('jobs');
                });
            }
        };
    }


    JobViewController.$inject = ['$scope', '$stateParams', '$location', '$state', '$modal', '$log', 'Authentication', 'Jobs', 'Companies', 'job', 'jobs', 'company'];

    angular.module('jobs')
        .controller('JobViewController', JobViewController);

})();
