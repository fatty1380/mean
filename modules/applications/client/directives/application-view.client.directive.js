(function () {
    'use strict';

    var text = {
        pre: {
            about: 'the applicant\'s full <strong>about me</strong> section will be available once you are connected',
            messaging: {
                owner: 'once you have connected, you will be able to converse with the Applicant to ask and answer questions, coordinate a telephone or in-person interview, or anything else to help you find the right employee.',
                driver: 'once you have connected, you will be able to converse with the Employer to ask and answer questions, coordinate a telephone or in-person interview, or anything else to help you find the right job.'
            }
        }
    };

    function ViewApplicantDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/applications/views/templates/os-applicant.client.template.html',
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

    function ApplicationSummaryController(auth, Applications, Drivers, Reports, $q, $log, toastr) {
        var vm = this;
        vm.text = text;

        vm.user = auth.user;

        function initialize() {
            var deferred = $q.defer();

            if (vm.application) {
                $log.debug('[ApplicationSummaryDirective] Displaying as %s: %o', vm.displayMode, vm.application);

                if (vm.displayMode === 'table') {
                    vm.messagingText = vm.application.isConnected ? 'click here for messaging' : 'available once connected';
                }

                deferred.resolve(vm.application);

            } else if (vm.job && vm.profile) {
                Applications.ForDriver.get({jobId: vm.job._id, userId: vm.profile._id})
                    .$promise.then(function (success) {
                        vm.application = success;

                        vm.lastMessage = vm.application.messages[0];

                        deferred.resolve(success);
                    }, function (failure) {
                        if (failure.status === 404) {
                            return undefined;
                        } else {
                            $log.error('Unable to lookup application based on job and user: %o', failure);
                            debugger;
                        }
                    });
            }

            deferred.promise.then(vm.setLocalProperties);
        }

        vm.setLocalProperties = function (application) {

            vm.profile = application.user;
            vm.driver = vm.profile.driver || Drivers.getByUser(vm.profile._id);
            vm.license = !!vm.driver.licenses && vm.driver.licenses.length ? vm.driver.licenses[0] : null;

            vm.experienceText = (
                !!vm.driver && !!vm.driver.experience && vm.driver.experience.length ?
                    'The applicant\'s experience will be available once connected' :
                    'You can discuss past job experience once you have connected'
            );

            if (!vm.driver) {
                debugger;
                Drivers.getByUser(vm.applicant._id).then(
                    function (success) {
                        vm.profile.driver = vm.driver = success;
                    }
                );
            }
        };

        vm.showDocument = function (doc, $event) {
            $event.stopPropagation();

            var file = doc === 'resume' ? vm.driver.resume : vm.driver.reports[doc];

            Reports.openReport(vm.application, vm.driver, file)
                .catch(function (error) {
                    vm.error = error;
                    toastr.error(error, {
                        extendedTimeOut: 5000
                    });

                });
        };

        initialize();
    }

    function ApplicationSummaryDirective() {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                switch (attrs.displayMode || 'normal') {
                    case 'details':
                        return '/modules/applications/views/templates/os-applicant.client.template.html';
                    case 'minimal':
                    case 'mine':
                    case 'table':
                        return '/modules/applications/views/templates/application-summary.client.template.html';
                    case 'inline':
                        return '/modules/applications/views/templates/applicant-normal.client.template.html';
                }
            },
            restrict: 'EA',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                application: '=model',
                job: '=?',
                profile: '=?',
                index: '=?',
                text: '=?',
                scrollToMessageFn: '&?'
            },
            controller: 'ApplicationSummaryController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    ApplicationSummaryController.$inject = ['Authentication', 'Applications', 'Drivers', 'Reports', '$q', '$log', 'toastr'];

    angular.module('applications')
        .controller('ApplicationSummaryController', ApplicationSummaryController)
        .directive('osetApplicationSummary', ApplicationSummaryDirective);

})();
