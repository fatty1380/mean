(function () {
    'use strict';

    // Drivers controller
    function DriverEditController($state, $log, Drivers, Authentication, driver) {
        var vm = this;

        // Functions:
        vm.submit = submit;
        vm.update = update;
        vm.create = create;
        vm.cancel = cancel;
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

                //addExperience();
            }
        }

        function submit() {

            if (vm.driverForm['vm.experienceForm'] && vm.driverForm['vm.experienceForm'].$pristine) {
                debugger;
                console.log ('Experience untouched ...');
                if(vm.driver.experience[0] && vm.driver.experience[0].isFresh) {
                    console.log('nuked experience');
                    vm.driver.experience = [];
                }
                vm.driverForm.$setValidity('vm.experienceForm', true);

            }
            if (vm.driverForm.$invalid) {
                debugger;
                vm.error = 'Please correct the errors above';
                return false;
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
                $log.debug('No license information entered, ignoring ...');
                vm.driver.licenses = null;
            } else if (vm.driverForm['vm.licenseForm'].$invalid) {
                vm.error = vm.driverForm['vm.licenseForm'].$error;
                return;
            }

            vm.driver.experience = _.compact(vm.driver.experience);

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

        function cancel() {
            $state.go('drivers.view', {driverId: vm.driver._id});
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

            vm.driver.experience.push({
                text: '',
                time: {
                    start: {},
                    end: {}
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
