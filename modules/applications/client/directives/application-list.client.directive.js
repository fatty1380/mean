(function () {
    'use strict';

    angular.module('applications')
        .directive('osListApplications', ListApplicationsDirective);


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
            link: link,
            controller: Controller,
            controllerAs: 'vm',
            bindToController: true
        };

        function link(scope, elem, attrs, vm) {
            vm.displayMode = vm.displayMode || 'normal';
            vm.company = vm.company || vm.job && vm.job.company;
            vm.config = vm.config || {};

            vm.newMessages = 0;
            vm.groupByJob = false;
            vm.noItemsText = 'No job applications yet';

            vm.activate();
        }
        

        return ddo;
    }


    Controller.$inject = ['Applications', 'Authentication', '$log', '$state', '$stateParams', '$location', '$q'];

    function Controller(Applications, Authentication, $log, $state, $stateParams, $location, $q) {
        var vm = this;

        vm.visibleId = $stateParams.itemId;
        vm.visibleTab = $stateParams.tabName;

        vm.ApplicationFactory = Applications;

        vm.user = vm.user || Authentication.user;

        vm.activate = function activate() {

            if (vm.jobs && vm.jobs.length) {
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
                if (!!vm.jobs && !_.find(vm.jobs, { '_id': vm.visibleId })) {
                    vm.visibleId = vm.visibleTab = null;
                    $state.transitionTo('applications.list', { 'itemId': vm.visibleId, 'tabName': vm.visibleTab });
                }
                else if (!vm.jobs && !_.find(vm.applications, { '_id': vm.visibleId })) {
                    vm.visibleId = vm.visibleTab = null;
                    $state.transitionTo('applications.list', { 'itemId': vm.visibleId, 'tabName': vm.visibleTab });
                }
            }
        };

    }


})();
