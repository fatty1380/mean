'use strict';

function JobItemController(Auth) {
    var dm = this;

    dm.auth = Auth;
    dm.displayMode = 'all';

    dm.showSection = function(section, only) {
        if (!only && dm.displayMode === 'all') {
            return true;
        }

        return dm.displayMode === section;
    };

    dm.setDisplay = function(section) {
        dm.displayMode = section || 'all';
    };
}

function JobDirective() {
    return {
        scope: {
            job: '=',
            inline: '=?',
            editSref: '@?',
            showEdit: '=?'
        },
        templateUrl: 'modules/jobs/views/templates/job.client.template.html',
        restrict: 'E',
        replace: true,
        controller: JobItemController,
        controllerAs: 'dm',
        bindToController: true
    };
}

function JobListController(Jobs, $log, $state) {
    var dm = this;

    dm.limitTo = dm.limitTo || 10;
    dm.companyId = dm.companyId || dm.company._id;
    dm.driverId = dm.driverId || (dm.driver && dm.driver.user._id);

    if (!dm.companyId && !dm.driverId) {
        $log.error('[%s] Must Specify either a company or driver', 'JobListController');
        $state.go('home');
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
JobItemController.$inject = ['Authentication'];

angular.module('jobs')
    .directive('osJob', JobDirective)
    .directive('osJobList', JobListDirective);
