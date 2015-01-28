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

        vm.visibleId = params.itemId;
        vm.visibleTab = params.tabName;

        vm.ApplicationFactory = Applications;
        vm.displayMode = vm.displayMode || 'normal';
        vm.company = vm.company || vm.job && vm.job.company;
        vm.user = vm.user || Authentication.user;
        vm.config = vm.config || {};

        vm.noItemsText = 'No job applications yet';

        function activate() {

            if (vm.applications && vm.applications.length) {
                var first = vm.applications[0];

                if (first.hasOwnProperty('job')) {
                    $log.debug('Looking at a list of applications');
                } else if (first.hasOwnProperty('applications')) {
                    $log.debug('Looking at a list of jobs :)');

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

        vm.setApplicationStatus = function(application, status, $event, state) {
            $event.stopPropagation();

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

        vm.showTab = function (itemId, tabName) {
            if(!!vm.visibleId && vm.visibleTab === tabName) {
                vm.visibleId = vm.visibleTab = null;
            } else {
                vm.visibleId = itemId;
                vm.visibleTab = tabName;
            }

            $state.transitionTo($state.current, {'itemId':vm.visibleId, 'tabName':vm.visibleTab});
        };

        activate();

    }

    JobApplicationListController.$inject = ['Applications', 'Authentication', '$log', '$state', '$stateParams'];

    angular.module('applications')
        .controller('JobApplicationListController', JobApplicationListController)
        .directive('osListApplications', ListApplicationsDirective);

})();
