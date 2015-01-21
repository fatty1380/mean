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
            controller: function (Applications, Authentication, $log) {
                var vm = this;

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

            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('applications')
        .directive('osListApplications', ListApplicationsDirective);

})();
