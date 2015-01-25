(function () {
    'use strict';

    function JobListController(Jobs, $log, $state, config, auth) {
        var vm = this;

        vm.config = vm.config || config.getModuleConfig(auth.user.type, 'jobs')
            .then(function (success) {
                vm.config = success;
            });

        config.getAsync('debug').then(function (success) {
            vm.debug = !!success;
        });

        vm.showSearch = vm.showSearch === undefined ? true : !!vm.showSearch;
        vm.limitTo = vm.limitTo || 10;
        vm.filter = {};

        vm.myJobsOnly = false;

        function activate() {

            if (!vm.companyId && !vm.driverId && !vm.srcJobs) {
                $log.warn('[%s] should Specify a company or driver, or set srcJobs pre-load', 'JobListController');

                if ($state.includes('jobs')) {
                    $log.error('[%s] Routing back to user\'s home page', 'JobListController');
                    $state.go('home');
                }
            }

            if (!!vm.companyId && !!vm.driverId) {
                $log.warn('[%s] Both company and driver specified, defaulting to company', 'JobListController');
            }

            if (!!vm.srcJobs && vm.srcJobs.length >= 0) {
                vm.jobs = vm.srcJobs;
            }
            else if (!!vm.companyId) {
                vm.filter.company = {'_id': vm.companyId};
                vm.myJobsOnly = true;

                vm.jobs = Jobs.ByCompany.query({
                    companyId: vm.companyId
                });
            } else if (!!vm.driverId) {
                vm.jobs = Jobs.ByUser.query({
                    userId: vm.driverId
                });
            } else {
                vm.jobs = [];
            }
        }

        vm.showMore = function () {
            vm.limitTo += 10;
        };

        vm.toggleFilterMine = function () {
            if ((vm.myJobsOnly = !vm.myJobsOnly)) {
                vm.filter.company = {'_id': vm.companyId};
            }
            else {
                if (vm.filter.hasOwnProperty('company')) {
                    delete vm.filter['company'];
                }
            }
        };

        vm.searchTermFilter = function (job) {
            if (!vm.searchTerms) {
                return true;
            }

            var terms = vm.searchTerms.split(' ');
            var reg = new RegExp('(?=' + terms.join(')(?=') + ')');

            job.searchText = job.searchText || [job.name, job.description, job.requirements].join(' ');

            return reg.test(job.searchText);
        };

        activate();
    }

    function JobListDirective() {
        return {
            templateUrl: 'modules/jobs/views/templates/job-list.client.template.html',
            restrict: 'E',
            replace: false,
            scope: {
                header: '@?',
                companyId: '@?',
                driverId: '@?',
                srcJobs: '=?',
                showPost: '=?',
                limitTo: '=?',
                config: '=?',
                showSearch: '=?'
            },
            controller: 'JobListController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    JobListController.$inject = ['Jobs', '$log', '$state', 'AppConfig', 'Authentication'];

    angular.module('jobs')
        .controller('JobListController', JobListController)
        .directive('osJobList', JobListDirective);

})();
