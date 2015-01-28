(function () {
    'use strict';

    function ViewApplicantController(auth) {
        var vm = this;

        vm.user = auth.user;
        vm.applicant = vm.application.user;
        vm.driver = vm.applicant.driver;
        vm.license = !!vm.driver && vm.driver.licenses[0];

        vm.isConnected = !!vm.application.connection && vm.application.connection.isValid;

        vm.experienceText = (vm.driver.experience && vm.driver.experience.length
            ? 'The applicant\'s experience will be available once connected'
            : 'You can discuss past job experience once you have connected');

        vm.text = {
            pre : {
                about : 'the applicant\'s full <strong>about me</strong> section will be available once you are connected',
                messaging: {
                    owner: 'once you have connected, you will be able to converse with the Applicant to ask and answer questions, coordinate a telephone or in-person interview, or anything else to help you find the right employee.',
                    driver: 'once you have connected, you will be able to converse with the Employer to ask and answer questions, coordinate a telephone or in-person interview, or anything else to help you find the right job.'
                }
            }
        };

    }

    function ViewApplicantDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/applications/views/templates/os-applicant.client.template.html',
            restrict: 'E',
            scope: {
                application: '=',
                scrollToMessageFn: '&?'
            },
            controller: 'ViewApplicantController',
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

    ViewApplicantController.$inject = ['Authentication'];

    angular.module('applications')
        .controller('ViewApplicantController', ViewApplicantController)
        .directive('osetApplicationSummary', ApplicationSummaryDirective)
        .directive('osetApplicant', ViewApplicantDirective);

})();
