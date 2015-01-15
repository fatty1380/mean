(function () {
    'use strict';

    // Jobs controller
    function JobsListController($state, Authentication, jobs, company) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;

        vm.enableEdit = false;

        vm.jobs = jobs;
        vm.company = company;

        function activate() {
            if ($state.is('jobs.list')) {
                vm.listTitle = 'Outset Job Listings';
            } else if ($state.is('jobs.mine')) {
                vm.listTitle = (vm.user.type === 'driver') ? 'My Jobs' : 'My Job Postings';
            }

            if (vm.user.type === 'driver') {
                vm.enableEdit = false;
            }
            else if (vm.user.type === 'owner') {
                vm.enableEdit = vm.user._id === (vm.company && (vm.company.owner._id || vm.company.owner));
            }
            else if (vm.user.isAdmin) {
                vm.enableEdit = true;
            }
        }

        activate();
    }

    JobsListController.$inject = ['$state', 'Authentication','jobs', 'company'];

    angular.module('jobs')
        .controller('JobsListController', JobsListController);

})();
