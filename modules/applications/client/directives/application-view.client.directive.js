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

    function ViewApplicantController(auth, $window, $log, Drivers) {
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
            !!vm.driver && !!vm.driver.experience && vm.driver.experience.length
                ? 'The applicant\'s experience will be available once connected'
                : 'You can discuss past job experience once you have connected'
        );

        vm.text = text;
        vm.resume = vm.resume || {};

        var validateAccess = function (file) {
            if (!vm.isConnected) {
                vm.error = 'Sorry, but you are not connected to this applicant';
                return false;
            }

            if (!vm.driver) {
                vm.error = 'Sorry, but the applicant\'s profile is not currently available';
                return false;
            }

            if (!file) {
                vm.error = 'Sorry, but that report is not available';
                return false;
            }

            return true;
        };

        var handleFileAccess = function (file) {
            vm.resume.loading = true;

            if (validateAccess(file)) {
                if (moment().isBefore(moment(file.expires))) {
                    vm.resume.loading = false;
                    $window.open(file.url, '_blank');
                }
                else {
                    Drivers.getDownloadLink(vm.driver._id, file.sku).then(
                        function (success) {
                            vm.resume.loading = false;
                            $log.debug('Got new resume link! %o', success);

                            file = success;
                            $window.open(file.url, '_blank');
                        },
                        function (err) {
                            vm.resume.loading = false;
                            $log.error('Error trying to load resume link', err);
                            vm.resume.error = 'Sorry, we were unable to load your resume at this time';
                        });
                }
            } else {
                vm.resume.loading = false;
                return false;
            }
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

    function ApplicationSummaryDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/applications/views/templates/application-summary.client.template.html',
            restrict: 'EA',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                model: '=',
                job: '=?',
                user: '=?',
                index: '=?'
            },
            controller: function (Applications, $log) {
                var vm = this;
                vm.displayMode = vm.displayMode || 'normal';
                vm.text = text;

                vm.application = vm.model;

                if (vm.application) {
                    $log.debug('[ApplicationSummaryDirective] Displaying as %s: %o', vm.displayMode, vm.application);

                    if (vm.displayMode === 'table') {
                        vm.user = vm.application.user;
                        vm.driver = vm.user.driver;
                        vm.license = vm.driver.licenses[0];

                        vm.messagingText = vm.application.isConnected ? 'click here for messaging' : 'available once connected';
                    }

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

    ViewApplicantController.$inject = ['Authentication', '$window', '$log', 'Drivers'];

    angular.module('applications')
        .controller('ViewApplicantController', ViewApplicantController)
        .directive('osetApplicationSummary', ApplicationSummaryDirective)
        .directive('osetApplicant', ViewApplicantDirective);

})();
