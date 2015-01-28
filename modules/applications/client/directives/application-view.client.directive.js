(function () {
    'use strict';

    function ViewApplicantDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/applications/views/templates/os-applicant.client.template.html',
            restrict: 'E',
            scope: {
                application: '=',
                scrollToMessageFn: '&?'
            },
            controller: function ctrl() {
                var vm = this;

                vm.applicant = vm.application.user;
                vm.driver = vm.applicant.driver;
                vm.license = vm.driver && vm.driver.licenses[0];

                vm.isConnected = vm.application.connection && vm.application.connection.isValid;

                vm.experienceText = (vm.driver.experience && vm.driver.experience.length
                    ? 'The applicant\'s experience will be available once connected'
                    : 'You can discuss past job experience once you have connected');


            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function ApplicationSummaryDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/applications/views/templates/application-summary.client.template.html',
            restrict: 'E',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                application: '=?model',
                job: '=?',
                user: '=?'
            },
            controller: function (Applications, $log) {
                var vm = this;
                vm.displayMode = vm.displayMode || 'normal';

                if (vm.application) {
                    $log.debug('[ApplicationSummaryDirective] Displaying as %s: %o', vm.displayMode, vm.application);
                } else if (vm.job && vm.user) {
                    Applications.ForDriver.get({jobId: vm.job._id, userId: vm.user._id})
                        .$promise.then(function (success) {
                            vm.application = success;

                            vm.lastMessage = vm.application.messages[0];
                        }, function (failure) {
                            if (failure.status === 404) {
                                return undefined;
                            } else {
                                $log.error('Unable to lookup application based on job and user: %o', failure);
                                debugger;
                            }
                        });
                }
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('applications')
        .directive('osetApplicationSummary', ApplicationSummaryDirective)
        .directive('osetApplicant', ViewApplicantDirective);

})();
