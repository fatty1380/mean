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
                applications: '=?'
            },
            controller: function (Applications, Authentication, $log) {
                var vm = this;

                vm.isEnabled = false;

                vm.displayMode = vm.displayMode || 'normal';
                vm.company = vm.company || vm.job && vm.job.company;
                vm.user = vm.user || Authentication.user;
                vm.noItemsText = 'No job applications yet';

                vm.findAll = function () {
                    $log.debug('[AppController.find] Searching for applications');

                    var jobId = vm.job && vm.job._id;

                    var promise;

                    if (jobId) {
                        $log.debug('[AppController.find] Looking for applications on jobID %o', jobId);

                        promise = Applications.ByJob.query({
                            jobId: jobId
                        }).$promise;
                    } else if (vm.user.type === 'driver') {
                        promise = Applications.ByUser.query({
                            userId: vm.user._id
                        }).$promise;
                    } else if (vm.user.type === 'owner' && vm.company) {
                        promise = Applications.ByCompany.query({
                            companyId: vm.company._id
                        }).$promise;
                    }

                    promise.then(function (applications) {
                        $log.debug('[AppController.find] Found %d applications', applications.length);
                        vm.applications = applications;
                    }, function (error) {
                        $log.error('[AppController.find] Error finding applications %o', error);
                    });
                };

                if (!vm.applications) {
                    vm.findAll();
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
