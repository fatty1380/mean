(function () {
    'use strict';

    // Drivers controller
    function DriverViewController($state, $log, $stateParams, $window, Authentication, Drivers, Profiles, driver) {
        var vm = this;

        vm.text = {
            bulletPoints: [
                'You will be applying to jobs with your Driver Profile.',
                'Applicants who have reports in their Driver Profile are <strong>8-12x more likely to be interviewed!</strong>',
                'More information in your Profile = better jobs: Include your reports (Background Check etc.), experience and endorsements.',
                'Show you’re reliable: Get reports like Background Checks, MVR’s & Drug Tests to be hosted in your Profile.',
                'Jobs will be available on Outset in 1 week, Get your Profile Ready!'
            ]
        };

        // Variables:
        vm.driver = driver;
        vm.user = null;
        vm.canEdit = false;
        vm.auth = Authentication;

        // Functions:
        vm.endorsementFilter = endorsementFilter;
        vm.endorsementDisplay = endorsementDisplay;

        function activate() {
            if (!!vm.driver) {
                // TODO - fix this shit logic
                vm.user = vm.driver.user;
                vm.canEdit = vm.user._id === Authentication.user._id;

            } else if ($stateParams.userId) {
                vm.user = Profiles.get({
                    userId: $stateParams.userId
                })
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

            vm.driver.resume = response;
        };

        vm.resume = vm.resume || {};

        vm.openResumeFile = function () {
            debugger;

            if (moment().isBefore(moment(vm.driver.resume.expires))) {
                $window.open(vm.driver.resume.url, '_blank');
            }
            else {
                vm.resume.loading = true;

                Drivers.getResumeLink(vm.driver._id).then(
                    function (success) {
                        vm.resume.loading = false;
                        $log.debug('Got new resume link! %o', success);

                        vm.driver.resume = success;
                        $window.open(vm.driver.resume.url, '_blank');
                    },
                    function (err) {
                        vm.resume.loading = false;
                        $log.error('Error trying to load resume link', err);
                        vm.resume.error = 'Sorry, we were unable to load your resume at this time';
                    });
            }
        };

    }

    DriverViewController.$inject = ['$state', '$log', '$stateParams', '$window', 'Authentication', 'Drivers', 'Profiles', 'driver'];

    angular.module('drivers').controller('DriverViewController', DriverViewController);
})();
