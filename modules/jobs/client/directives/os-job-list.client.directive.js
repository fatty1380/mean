(function() {
    'use strict';


    function JobListController (Jobs, $log, $state) {
        var dm = this;

        dm.limitTo = dm.limitTo || 10;
        dm.companyId = dm.companyId || (dm.company && dm.company._id);
        dm.driverId = dm.driverId || (dm.driver && dm.driver.user._id);

        if (!dm.companyId && !dm.driverId && !dm.srcJobs) {
            $log.warn('[%s] should Specify a company or driver, or set srcJobs pre-load', 'JobListController');

            if($state.includes('jobs')) {
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
    }

    function JobListDirective() {
        return {

            templateUrl: 'modules/jobs/views/templates/job-list.client.template.html',
            restrict: 'E',
            replace: false,
            scope: {
                header: '@?',
                companyId: '@?',
                company: '=?',
                driverId: '@?',
                driver: '=?',
                srcJobs: '=?',
                showPost: '=?',
                limitTo: '@?'
            },
            controller: JobListController,
            controllerAs: 'dm',
            bindToController: true
        };
    }

    JobListController.$inject = ['Jobs', '$log', '$state'];

    angular.module('jobs')
        .directive('osJobList', JobListDirective);

})();
