(function () {
    'use strict';

    // Drivers controller
    function DriverEditController($state, $log, Drivers, Authentication, driver, AppConfig) {
        var vm = this;

        vm.debug = AppConfig.get('debug');

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
        vm.driver = _.defaults(driver || {}, {experience: [], licenses: [{}], interests: []});

        // Driver Interests ---------------------------------------------------------

        vm.newInterest = null;

        vm.driverInterests = vm.driver.interests;

        vm.interestOptions = (AppConfig.get('interests') || {
            driver: [
                {key: 'Courier', value: false},
                {key: 'Local CDL', value: false},
                {key: 'Long Haul CDL', value: false},
                {key: 'Taxi/Limo', value: false},
                {key: 'Ridesharing (Uber/Lyft)', value: false},
                {key: 'Non-Emergency Medical', value: false}
            ]
        }).driver;

        _.each(vm.interestOptions, function (option) {

            if (_.find(vm.driverInterests, {key: option.key})) {
                console.log('driver already contains %s', option);
            }
            else {
                console.log('pushing interest option %s', option);
                vm.driverInterests.push(option);
            }

        });

        vm.toggleInterest = function (interest) {
            if (vm.newInterest === null) {
                vm.newInterest = '';
            } else {
                vm.newInterest = null;
            }
        };

        vm.addInterest = function () {
            if (!!vm.newInterest) {
                var existing = _.find(vm.driver.interests, {key: vm.newInterest});

                if (existing) {
                    existing.value = true;
                } else {
                    vm.driver.interests.push({key: vm.newInterest, value: true});
                }
            }
            vm.newInterest = null;
        };

        // Driver Interests -- END ----------------------------------------------------

        function activate() {

            if ($state.is('drivers.create')) {
                if (!!vm.driver && !!vm.driver._id) {
                    $state.go('drivers.edit', {driverId: vm.driver._id});
                }

                //addExperience();
            }
        }

        function submit() {
            debugger;
            if (vm.driverForm['vm.experienceForm'] && vm.driverForm['vm.experienceForm'].$pristine) {

                console.log('Experience untouched ...');
                if (vm.driver.experience[0] && vm.driver.experience[0].isFresh) {
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

            if (_.isEmpty(vm.driver.licenses[0])) {
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
                vm.error = !errorResponse.data || errorResponse.status === 0 ? 'Error saving your profile. Please try again later.' : errorResponse.data.message;
            });
        }

        function cancel() {
            $state.go('drivers.view', {driverId: vm.driver._id});
        }

        // Update existing Driver
        function update() {
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

    DriverEditController.$inject = ['$state', '$log', 'Drivers', 'Authentication', 'driver', 'AppConfig'];

    angular.module('drivers').controller('DriverEditController', DriverEditController);
})
();
