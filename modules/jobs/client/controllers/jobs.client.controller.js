(function () {
    'use strict';

    // Jobs controller
    function JobsListController($state, Authentication, jobs, company, moduleConfig) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;
        vm.config = moduleConfig || {};

        vm.enableEdit = !!vm.configs.edit;

        vm.jobs = jobs;
        vm.company = company;

        function activate() {
            if ($state.is('jobs.list')) {
                vm.listTitle = 'Outset Job Listings';
            } else if ($state.is('jobs.mine')) {
                vm.listTitle = (vm.user.type === 'driver') ? 'My Jobs' : 'My Job Postings';
            }

            // TODO: Split out into Edit/Create/List permissions
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

    JobsListController.$inject = ['$state', 'Authentication','jobs', 'company', 'config'];

    angular.module('jobs')
        .controller('JobsListController', JobsListController);

})();
