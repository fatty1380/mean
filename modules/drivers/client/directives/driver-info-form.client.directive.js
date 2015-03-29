(function () {
    'use strict';

    function DriverInfoFormCtrl($log, $q,$document, Drivers, auth) {
        var vm = this;

        vm.text = _.defaults(vm.text || {}, {
            about: null
        });

        vm.methods = _.defaults({
            init: function() {
                if(!vm.user || _.isEmpty(vm.user)) {
                    vm.user = $q.when(auth.user);
                }

                $q.when(vm.driver).then(function(driverResponse) {
                    vm.driver = _.defaults(driverResponse || {}, Drivers.default);
                });
            },
            submit: function () {
                //return Drivers.createUser(vm.model);

                var promise = Drivers.ById
                    .get({driverId: vm.driver._id}).$promise;

                promise.then(
                    function (existingDriver) {
                        $log.debug('Loaded full Driver Profile from server: %o', existingDriver);
                        debugger;
                        existingDriver.experience = vm.driver.experience;
                        existingDriver.interests = vm.driver.interests;
                        existingDriver.licenses = vm.driver.licenses;
                        existingDriver.about = vm.driver.about;

                        return existingDriver;
                    }).then(
                    function (driver) {
                        driver.$update(
                            function (updatedDriver) {

                                $log.debug('Successfully updated DRIVER with details');

                                vm.driver = updatedDriver;

                            },
                            function (errorResponse) {
                                vm.error = errorResponse.data.message;
                                vm.loading = false;
                            });
                    });
            },
            validate: function () {
                var deferred = $q.defer();

                var isValid = vm.validateSubForms();

                if (!!vm.form && vm.form.$invalid) {
                    isValid = false;

                    _.map(_.keys(vm.form.$error), function (errorType) {
                        $log.warn('[SignupApply.validateForm] Form %d has error type: %s', vm.currentStep, errorType);
                        _.map(vm.form.$error[errorType], function (item) {
                            $log.error('[SignupApply.validateForm] %s has error: %o', !!item ? item.$name : 'n/a', item);
                            if (!!item) {
                                item.$setDirty(true);
                            }
                        });
                    });
                    deferred.reject('Please correct the errors above');
                }

                if (!!isValid) {
                    deferred.resolve('User Form is Valid');
                } else {
                    deferred.reject('Please correct the errors above');
                }

                return deferred.promise;
            }

        }, vm.methods);

        vm.validateSubForms = function () {

            vm.form.$setSubmitted(true);

            vm.licenseForm = vm.form['vm.licenseForm'];
            if (!!vm.licenseForm) {
                vm.licenseForm.$setSubmitted(true);
            }

            vm.experienceForm = vm.form['vm.experienceForm'];
            if (!!vm.experienceForm) {
                vm.experienceForm.$setSubmitted(true);
            }

            if (vm.experienceForm && vm.experienceForm.$pristine) {

                console.log('Experience untouched ...');
                if (vm.driver.experience[0] && vm.driver.experience[0].isFresh) {
                    console.log('nuked experience');
                    vm.driver.experience = [];
                }
                vm.form.$setValidity('vm.experienceForm', true);

            }

            var strippedString = vm.driver.about && vm.driver.about.replace(/(<([^>]+)>)/ig, '') || '';
            if (strippedString.length <= 0) {
                debugger;
                vm.introTextError = 'Please add a message to the employer before continuing';
                vm.form.$setValidity('introText', false);
                return false;
            }
            else {
                vm.introTextError = null;
                vm.form.$setValidity('introText', true);
            }

            if (vm.form.$invalid) {
                if (vm.form.$error.required) {
                    vm.error = 'Please fill in all required fields before saving';
                    $document.scrollTopAnimated(0, 300);
                }
                else {
                    vm.error = 'Please correct the errors on the page before saving';
                }

                return false;
            }

            return true;
        };

        vm.methods.init();
    }

    DriverInfoFormCtrl.$inject = ['$log', '$q', '$document', 'Drivers', 'Authentication'];

    function DriverInfoFormDirective() {
        return {
            templateUrl: '/modules/drivers/views/templates/driver-info-form.client.template.html',
            restrict: 'E',
            require: ['^form'],
            scope: {
                user: '=?',
                driver: '=model',
                text: '=?',
                methods: '='
            },
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            },
            controller: 'DriverInfoFormController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('drivers')
        .controller('DriverInfoFormController', DriverInfoFormCtrl)
        .directive('driverInfoForm', DriverInfoFormDirective);
})();
