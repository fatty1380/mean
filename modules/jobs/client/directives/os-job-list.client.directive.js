(function () {
    'use strict';

    function JobListController(Jobs, $log, $state, auth) {
        var dm = this;

        dm.limitTo = dm.limitTo || 10;
        dm.filter = {'company': undefined};

        dm.myJobsOnly = false;

        if (!dm.companyId && !dm.driverId && !dm.srcJobs) {
            $log.warn('[%s] should Specify a company or driver, or set srcJobs pre-load', 'JobListController');

            if ($state.includes('jobs')) {
                $log.error('[%s] Routing back to user\'s home page', 'JobListController');
                $state.go('home');
            }
        }

        if (!!dm.companyId && !!dm.driverId) {
            $log.warn('[%s] Both company and driver specified, defaulting to company', 'JobListController');
        }

        if (!!dm.srcJobs && dm.srcJobs.length >= 0) {
            dm.jobs = dm.srcJobs;
        }
        else if (!!dm.companyId) {
            dm.jobs = Jobs.ByCompany.query({
                companyId: dm.companyId
            });
        } else if (!!dm.driverId) {
            dm.jobs = Jobs.ByUser.query({
                userId: dm.driverId
            });
        } else {
            dm.jobs = [];
        }

        dm.showMore = function () {
            dm.limitTo += 10;
        };

        dm.toggleFilterMine = function () {
            if ((dm.myJobsOnly = !dm.myJobsOnly)) {
                dm.filter.company = { owner: auth.user._id };
            }
            else {
                dm.filter.company = undefined;
            }
        };

        dm.searchTermFilter = function(job) {
            if(!dm.searchTerms) {
                return true;
            }

            var terms = dm.searchTerms.split(' ');
            var reg = new RegExp('(?=' + terms.join(')(?=') + ')');

            job.searchText = job.searchText || [job.name, job.description, job.requirements].join(' ');

            return reg.test(job.searchText);
        };
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
                limitTo: '=?'
            },
            controller: JobListController,
            controllerAs: 'dm',
            bindToController: true
        };
    }

    JobListController.$inject = ['Jobs', '$log', '$state', 'Authentication'];

    angular.module('jobs')
        .directive('osJobList', JobListDirective);

})();
