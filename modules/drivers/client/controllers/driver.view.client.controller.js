(function() {
    'use strict';

    // Drivers controller
    function DriverViewController($state, $log, $stateParams, Authentication, Profiles, driver) {
        var vm = this;

        // Variables:
        vm.driver = driver;
        vm.user = null;
        vm.canEdit = false;

        // Functions:
        vm.endorsementFilter = endorsementFilter;
        vm.endorsementDisplay = endorsementDisplay;

        function activate() {
            if (!!vm.driver) {
                vm.user = vm.driver.user;
                vm.canEdit = vm.user._id === Authentication.user._id;
            } else if ($stateParams.userId) {
                vm.user = Profiles.get({
                        userId: $stateParams.userId
                    })
                    .$promise
                    .then(function(profile) {
                        debugger;
                        vm.user = profile;

                        vm.canEdit = $stateParams.userId === vm.user._id;
                    });
            } else if($state.is('drivers.home')) {
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

    }

    DriverViewController.$inject = ['$state', '$log', '$stateParams', 'Authentication', 'Profiles', 'driver'];

    angular.module('drivers').controller('DriverViewController', DriverViewController);
})();
