(function () {
    'use strict';

    // Drivers controller
    function DriverEditController($state, $log, Drivers, Authentication, driver) {
        var vm = this;

        // Functions:
        vm.submit = submit;
        vm.update = update;
        vm.create = create;
        vm.dropExperience = dropExperience;
        vm.addExperience = addExperience;

        // Variables:
        vm.user = Authentication.user;
        vm.action = $state.current.name.replace('drivers.', '');
        vm.driver = driver || {
            experience: [],
            licenses: [{}]
        };



        function activate() {

            if ($state.is('drivers.create')) {
                if (!!vm.driver._id) {
                    $state.go('drivers.edit', {driverId: vm.driver._id});
                }
            }
        }

        function submit() {
            debugger;
            if (vm.driverForm.$invalid) {
                debugger;
                vm.error = vm.driverForm.$error;
                return;
            }

            if ($state.is('drivers.create')) {
                return vm.create();
            } else if ($state.is('drivers.edit')) {
                return vm.update();
            }

            vm.error = 'Unknown Configuration, sorry :(';
        }

        // Create new Driver
        function create() {
            debugger;

            if(_.isEmpty(vm.driver.licenses[0])) {
                $log.debug('No license information entered, ignoring ...')
                vm.driver.licenses = null;
            } else if (vm.driverForm['vm.licenseForm'].$invalid) {
                vm.error = vm.driverForm['vm.licenseForm'].$error;
                return;
            }

            // TODO: determine if this is necessary on the client side or if it is better handled on the server
            angular.forEach(vm.driver.experience, function (exp, i) {
                var start = new Date(exp.time.start.year, exp.time.start.month - 1);
                var end = new Date(exp.time.end.year, exp.time.end.month - 1);

                exp.time.start = start;
                exp.time.end = end;

                $log.debug('Start %o vs %o', start, exp.time.start, vm.driver.experience[i].time.start);
            });

            if (vm.driver.experience && vm.driver.experience.length > 0) {
                $log.debug('After iter: %o', vm.driver.experience[0].time.start);
            }

            // Create new Driver object
            var driver = new Drivers.ById(vm.driver);

            // Redirect after save
            driver.$save(function (response) {
                $log.debug('Successfully created new Driver');
                $state.go('drivers.view', {
                    driverId: response._id
                });
            }, function (errorResponse) {
                vm.error = errorResponse.data.message;
            });
        }

        // Update existing Driver
        function update() {
            debugger;
            if(vm.driverForm.$pristine) {
                $state.go('drivers.home');
            }

            var driver = vm.driver;

            driver.$update(function (response) {

                if (response.user._id === vm.user._id) {
                    $state.go('drivers.home');
                } else {
                    $state.go('drivers.view', {
                        driverId: response._id
                    });
                }
            }, function (errorResponse) {
                vm.error = errorResponse.data.message;
            });
        }

        // TODO: Move to "Experience" controller


        function dropExperience(exp) {
            exp = exp || vm.exp;

            if (exp) {
                for (var i in vm.driver.experience) {
                    if (vm.driver.experience[i] === exp) {
                        vm.driver.experience.splice(i, 1);
                    }
                }
            }
        }

        function addExperience() {
            event.preventDefault();

            vm.driver.experience.push({
                text: '',
                time: {
                    start: {
                        month: null,
                        year: null
                    },
                    end: {
                        month: null,
                        year: null
                    }
                },
                location: '',
                isFresh: true
            });
        }

        activate();

    }

    DriverEditController.$inject = ['$state', '$log', 'Drivers', 'Authentication', 'driver'];

    angular.module('drivers').controller('DriverEditController', DriverEditController);
})();
