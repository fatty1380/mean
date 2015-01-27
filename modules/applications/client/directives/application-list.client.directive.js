(function () {
    'use strict';

    function ListApplicationsDirective() {
        var ddo;

        ddo = {
            templateUrl: 'modules/applications/views/templates/os-list-applications.client.template.html',
            restrict: 'E',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                job: '=?',
                company: '=?',
                user: '=?',
                applications: '=?',
                config: '=?'
            },
            controller: 'JobApplicationListController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function JobApplicationListController(Applications, Authentication, $log, $state, params) {
        var vm = this;

        vm.visibleJob = params.jobId;
        vm.visibleTab = params.tabname;

        vm.ApplicationFactory = Applications;
        vm.displayMode = vm.displayMode || 'normal';
        vm.company = vm.company || vm.job && vm.job.company;
        vm.user = vm.user || Authentication.user;
        vm.config = vm.config || {};

        vm.noItemsText = 'No job applications yet';

        if(!!vm.visibleJob && !_.find(vm.jobs, {'_id':vm.visibleJob})) {
            debugger;
            vm.visibleJob = vm.visibleTab = null;
            $state.transitionTo('applications.list', {'jobId':vm.visibleJob, 'tabname':vm.visibleTab});
        }

        if(vm.applications && vm.applications.length) {
            var first = vm.applications[0];

            if(first.hasOwnProperty('job')) {
                $log.debug('Looking at a list of applications');
            } else if (first.hasOwnProperty('applications')) {
                $log.debug('Looking at a list of jobs :)');

                vm.jobs = vm.applications;
            }
        }

        vm.setApplicationStatus = function(application, status, $event, state) {
            $event.stopPropagation();
            debugger;
            var app = vm.ApplicationFactory.setStatus(application._id, status);

            app.then(function(success) {
                $log.debug('[setApplicationStatus] %s', success);
                application = success;
            }, function(reject) {
                debugger;
                $log.warn('[setApplicationStatus] %s', reject);
            });

            state.application.status = status;
            state.application.isNew = state.application.isConnected = false;
            state.application.isRejected = true;
            state.application.disabled = true;
        };

        vm.showTab = function (jobId, tabname) {
            vm.visibleJob = jobId;
            vm.visibleTab = tabname;
            debugger;

            $state.transitionTo('applications.list', {'jobId':vm.visibleJob, 'tabname':vm.visibleTab});
        };

    }

    JobApplicationListController.$inject = ['Applications', 'Authentication', '$log', '$state', '$stateParams'];

    angular.module('applications')
        .controller('JobApplicationListController', JobApplicationListController)
        .directive('osListApplications', ListApplicationsDirective);

})();
