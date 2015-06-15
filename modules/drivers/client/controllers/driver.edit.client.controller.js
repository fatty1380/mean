(function () {
    'use strict';

    // Drivers controller
    function DriverEditController($state, $log, Drivers, Authentication, driver, AppConfig, $document, Applications) {
        var vm = this;

        if (!Authentication.user) {
            return $state.go('intro');
        }

        // Variables:
        vm.user = Authentication.user;
        vm.action = $state.current.name.replace('drivers.', '');
        vm.driver = _.defaults(driver || {}, {
            experience: [],
            licenses: [{}],
            interests: [],
            profile: {responses: [], questions: []}
        });

        //if (typeof vm.user.driver === 'string' && vm.user.driver !==vm.driver._id) {
        //    return $state.go('home');
        //}
        //else if (typeof vm.user.driver === 'object' && vm.user.driver._id ===vm.driver._id) {
        //    return $state.go('home');
        //}

        vm.debug = AppConfig.get('debug');

        // Functions:
        vm.submit = submit;
        vm.update = update;
        vm.create = create;
        vm.cancel = cancel;

        vm.methods = {
            submit: submit,
            update: update,
            create: create,
            cancel: cancel
        };

        function activate() {

            if ($state.is('drivers.create')) {
                if (!!vm.driver && !!vm.driver._id) {
                    $state.go('drivers.edit', {driverId: vm.driver._id});
                }
            }

            if (!vm.driver.profile.questions || _.isEmpty(vm.driver.profile.questions)) {
                vm.driver.profile.questions = Applications.getQuestions();
            }

            if (!vm.driver.profile.responses || _.isEmpty(vm.driver.profile.responses)) {
                vm.driver.profile.responses = {
                    'default': []
                };
            }
        }

        function submit() {
            vm.driverForm.$setSubmitted(true);

            vm.licenseForm = vm.driverForm['vm.licenseForm'];
            if (!!vm.licenseForm) {
                vm.licenseForm.$setSubmitted(true);
            }

            vm.experienceForm = vm.driverForm['vm.experienceForm'];
            if (!!vm.experienceForm) {
                vm.experienceForm.$setSubmitted(true);
            }

            if (vm.experienceForm && vm.experienceForm.$pristine) {

                console.log('Experience untouched ...');
                if (vm.driver.experience[0] && vm.driver.experience[0].isFresh) {
                    console.log('nuked experience');
                    vm.driver.experience = [];
                }
                vm.driverForm.$setValidity('vm.experienceForm', true);

            }

            if (vm.driverForm.$invalid) {
                if (vm.driverForm.$error.required) {
                    vm.error = 'Please fill in all required fields before saving';
                    $document.scrollTopAnimated(0, 300);
                }
                else {
                    vm.error = 'Please correct the errors on the page before saving';
                }

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

                if (response.user.id === vm.user.id) {
                    $state.go('users.view');
                } else {
                    $state.go('drivers.view', {
                        driverId: response._id
                    });
                }
            }, function (errorResponse) {
                vm.error = errorResponse.data.message;
            });
        }

        activate();

    }

    DriverEditController.$inject = ['$state', '$log', 'Drivers', 'Authentication', 'driver', 'AppConfig', '$document', 'Applications'];

    angular.module('drivers').controller('DriverEditController', DriverEditController);
})
();
