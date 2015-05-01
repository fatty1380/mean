(function () {
    'use strict';

    function ListApplicationsDirective() {
        var ddo;

        ddo = {
            templateUrl: '/modules/applications/views/templates/os-list-applications.client.template.html',
            restrict: 'E',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                job: '=?',
                company: '=?',
                user: '=?',
                applications: '=?',
                jobs: '=?',
                config: '=?'
            },
            controller: 'JobApplicationListController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function JobApplicationListController(Applications, Authentication, $log, $state, params, $location, $q) {
        var vm = this;

        vm.visibleId = params.itemId;
        vm.visibleTab = params.tabName;

        vm.ApplicationFactory = Applications;
        vm.displayMode = vm.displayMode || 'normal';
        vm.company = vm.company || vm.job && vm.job.company;
        vm.user = vm.user || Authentication.user;
        vm.config = vm.config || {};

        vm.newMessages = 0;
        vm.groupByJob = false;
        vm.noItemsText = 'No job applications yet';

        function activate() {

            if(vm.jobs && vm.jobs.length) {
                $log.debug('Job list (length %d) is already calculated', vm.jobs.length);
                vm.groupByJob = true;
            }
            else if (vm.applications && vm.applications.length) {
                var first = vm.applications[0];

                if (first.hasOwnProperty('job')) {
                    $log.debug('Looking at a list of applications');
                    vm.groupByJob = false;
                } else if (first.hasOwnProperty('applications')) {
                    $log.debug('Looking at a list of jobs :)');
                    vm.groupByJob = true;

                    vm.jobs = vm.applications;
                }
            }

            if (!!vm.visibleId) {
                if (!!vm.jobs && !_.find(vm.jobs, {'_id': vm.visibleId})) {
                    vm.visibleId = vm.visibleTab = null;
                    $state.transitionTo('applications.list', {'itemId': vm.visibleId, 'tabName': vm.visibleTab});
                }
                else if (!vm.jobs && !_.find(vm.applications, {'_id': vm.visibleId})) {
                    vm.visibleId = vm.visibleTab = null;
                    $state.transitionTo('applications.list', {'itemId': vm.visibleId, 'tabName': vm.visibleTab});
                }
            }
        }

        activate();

    }

    JobApplicationListController.$inject = ['Applications', 'Authentication', '$log', '$state', '$stateParams', '$location', '$q'];

    angular.module('applications')
        .controller('JobApplicationListController', JobApplicationListController)
        .directive('osListApplications', ListApplicationsDirective);

})();
