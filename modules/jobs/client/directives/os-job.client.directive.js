'use strict';

function JobDirective() {
    return {
        scope: {
            job: '=',
            inline: '='
        },
        templateUrl: 'modules/jobs/views/templates/job.client.template.html',
        restrict: 'E',
        replace: true,
        controller: 'JobsController',
        controllerAs: 'ctrl'
    };
}

function JobListController(Jobs, $log, $state) {
    this.companyId = this.companyId || this.company._id;
    this.driverId = this.driverId || (this.driver && this.driver.user._id);

    if (!this.companyId && !this.driverId) {
        $log.error('[%s] Must Specify either a company or driver', 'JobListController');
        $state.go('home');
    }

    if (!!this.companyId && !!this.driverId) {
        $log.warn('[%s] Both company and driver specified, defaulting to company', 'JobListController');
    }

    if (!!this.companyId) {
        this.jobs = Jobs.ByCompany.query({
            companyId: this.companyId
        });
    } else if (!!this.driverId) {
        this.jobs = Jobs.ByUser.query({
            userId: this.driverId
        });
    }
}

function JobListDirective() {
    return {

        templateUrl: 'modules/jobs/views/templates/job-list.client.template.html',
        restrict: 'E',
        replace: false,
        scope: {
            header: '@?',
            companyId: '=?',
            company: '=?',
            driverId: '=?',
            driver: '=?'
        },
        controller: JobListController,
        controllerAs: 'ctrl',
        bindToController: true
    };
}

JobListController.$inject = ['Jobs', '$log', '$state'];

angular.module('jobs')
    .directive('osJob', JobDirective)
    .directive('osJobList', JobListDirective);
