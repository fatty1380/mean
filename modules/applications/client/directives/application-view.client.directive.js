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

    function ViewApplicantController(auth, $window, $log, $state, Drivers, Reports) {
        var vm = this;

        vm.user = auth.user;
        vm.applicant = vm.application.user;
        vm.driver = vm.applicant.driver;
        vm.license = !!vm.driver && vm.driver.licenses[0];

        vm.isConnected = !!vm.application.isConnected && !!vm.application.connection && vm.application.connection.isValid;

        if (!vm.driver) {
            debugger;
            Drivers.getByUser(vm.applicant._id).then(
                function (success) {
                    vm.applicant.driver = vm.driver = success;
                },
                function (err) {
                    $log.error('Unable to find driver for applicant: %s', vm.applicant._id);
                }
            );
        }

        vm.experienceText = (
            !!vm.driver && !!vm.driver.experience && vm.driver.experience.length ?
                'The applicant\'s experience will be available once connected' :
                'You can discuss past job experience once you have connected'
        );

        vm.text = text;
        vm.resume = vm.resume || {};

        var handleFileAccess = function (file) {

            vm.resume.loading = true;

            Reports.openReport(vm.application, vm.driver, file);

            vm.resume.loading = false;
        };

        vm.openResumeFile = function () {
            $log.debug('Opening Resume File');
            handleFileAccess(vm.driver && vm.driver.resume);
        };

        vm.openReport = function (reportName) {
            $log.debug('Opening Report type %s', reportName);
            handleFileAccess(vm.driver && vm.driver.reports[reportName]);
        };

    }

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

    function ApplicationSummaryController(Applications, Drivers, Reports, $q, $log, toaster) {
        var vm = this;
        vm.text = text;


        function initialize() {
            var deferred = $q.defer();

            if (vm.application) {
                $log.debug('[ApplicationSummaryDirective] Displaying as %s: %o', vm.displayMode, vm.application);

                if (vm.displayMode === 'table') {
                    vm.messagingText = vm.application.isConnected ? 'click here for messaging' : 'available once connected';
                }

                deferred.resolve(vm.application);

            } else if (vm.job && vm.user) {
                Applications.ForDriver.get({jobId: vm.job._id, userId: vm.user._id})
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
        };

        vm.showDocument = function (doc, $event) {
            $event.stopPropagation();

            var file = doc === 'resume' ? vm.driver.resume : vm.driver.reports[doc];

            Reports.openReport(vm.application, vm.driver, file)
                .catch(function (error) {
                    vm.error = error;
                    toaster.pop('error', error);

                });
        };

        initialize();
    }

    function ApplicationSummaryDirective() {
        var ddo;
        ddo = {
            templateUrl: function (elem, attrs) {
                switch (attrs.mode || 'normal') {
                    case 'minimal':
                    case 'mine':
                    case 'inline':
                    case 'table':
                        return '/modules/applications/views/templates/application-summary.client.template.html';
                    case 'normal':
                        return '/modules/applications/views/templates/applicant-normal.client.template.html';
                }
            },
            restrict: 'EA',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                application: '=model',
                job: '=?',
                user: '=?',
                index: '=?'
            },
            controller: 'ApplicationSummaryController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    ApplicationSummaryController.$inject = ['Applications', 'Drivers', 'Reports', '$q', '$log', 'toaster'];
    ViewApplicantController.$inject = ['Authentication', '$window', '$log', '$state', 'Drivers', 'Reports'];

    angular.module('applications')
        .controller('ViewApplicantController', ViewApplicantController)
        .controller('ApplicationSummaryController', ApplicationSummaryController)
        .directive('osetApplicationSummary', ApplicationSummaryDirective)
        .directive('osetApplicant', ViewApplicantDirective);

})();
