(function () {
    'use strict';

    function JobApplicationListController(Applications, Authentication, $log, $state) {
        var vm = this;

        vm.ApplicationFactory = Applications;
        vm.displayMode = vm.displayMode || 'normal';
        vm.company = vm.company || vm.job && vm.job.company;
        vm.user = vm.user || Authentication.user;
        vm.config = vm.config || {};

        vm.noItemsText = 'No job applications yet';

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
        };

    }

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

    angular.module('applications')
        .controller('JobApplicationListController', JobApplicationListController)
        .directive('osListApplications', ListApplicationsDirective);

})();
