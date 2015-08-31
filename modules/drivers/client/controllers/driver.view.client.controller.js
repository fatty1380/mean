(function () {
    'use strict';
    
    angular.module('drivers').controller('DriverViewController', DriverViewController);

    // Drivers controller
    DriverViewController.$inject = ['$state', '$log', '$stateParams', 'Authentication', 'Drivers', 'Profiles', 'AppConfig', 'driver'];
    function DriverViewController($state, $log, $stateParams, Authentication, Drivers, Profiles, AppConfig, driver) {
        var vm = this;

        if(!Authentication.user) {
            return $state.go('intro');
        }

        vm.text = {
            bulletPoints: [
                'You will be applying to jobs with your Driver Profile.',
                'Applicants who have reports in their Driver Profile are <strong>8-12x more likely to be interviewed!</strong>',
                'More information in your Profile = better jobs: Include your reports (Background Check etc.), experience and endorsements.',
                'Show you’re reliable: Get reports like Background Checks, MVR’s & Drug Tests to be hosted in your Profile.'
            ]
        };

        // Variables:
        vm.driver = driver;
        vm.user = null;
        vm.canEdit = false;
        vm.auth = Authentication;

        vm.reports = AppConfig.getReports() || {};

        // Functions:
        vm.endorsementFilter = endorsementFilter;
        vm.endorsementDisplay = endorsementDisplay;

        function activate() {
            if (!!vm.driver) {
                // TODO - fix this logic
                vm.user = vm.driver.user;
                vm.canEdit = vm.user._id === Authentication.user._id;

            } else if ($stateParams.userId) {
                vm.user = Profiles.load($stateParams.userId)
                    .$promise
                    .then(function (profile) {
                        debugger;
                        vm.user = profile;

                        vm.canEdit = $stateParams.userId === vm.user._id;
                    });
            } else if ($state.is('drivers.home')) {
                vm.user = Authentication.user;
                vm.canEdit = true;
            } else {
                debugger;
            }
        }

        activate();

        // Methods

        function endorsementFilter(item) {
            return item.value === true;
        }

        function endorsementDisplay(item) {
            var i = item.key.indexOf('(');
            if (i > 0) {
                return item.key.substring(0, i).trim();
            }
            return item.key;
        }

        // Change Picture Success method:
        vm.successFunction = function (fileItem, response, status, headers) {
            // Populate user object
            debugger;

            vm.driver.reports.resume = response;
        };

        var validateAccess = function (file) {
            if (!file) {
                vm.error = 'Sorry, but that report is not available';
                return false;
            }

            return true;
        };

        var handleFileAccess = function (file) {
            vm.resumeLoading = true;

            if (validateAccess(file)) {
                $state.go('drivers.documents', {driverId: vm.driver._id, documentId: file.sku || 'resume'});
            } else {
                vm.resumeLoading = false;
                return false;
            }
        };

        vm.openResumeFile = function () {
            $log.debug('Opening Resume File');
            handleFileAccess(vm.driver && vm.driver.reports.resume);
        };

        vm.openReport = function (reportName) {
            $log.debug('Opening Report type %s', reportName);
            handleFileAccess(vm.driver && vm.driver.reports[reportName]);
        };

    }
})();
