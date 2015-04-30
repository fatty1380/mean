(function () {
    'use strict';

    // Jobs controller
    function JobViewController($stateParams, $state, $log, Authentication, job, applications) {

        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        vm.enableEdit = false;

        vm.job = job;
        vm.applications = applications;
        vm.company = job && typeof job.company === 'object' && job.company || undefined;

        function activate() {

            if (vm.user.isAdmin) {
                vm.enableEdit = true;
            }
            else if (!vm.user || vm.user.isDriver) {
                vm.enableEdit = false;
            }
            else if (vm.user.isOwner) {
                vm.enableEdit = vm.user._id === (vm.company && (vm.company.owner._id || vm.company.owner));
            }
        }

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
                    $state.go('home');
                });
            }
        };


        activate();

    }


    JobViewController.$inject = ['$stateParams', '$state', '$log', 'Authentication','job', 'applications'];

    angular.module('jobs')
        .controller('JobViewController', JobViewController);

})();
