(function () {
    'use strict';

    function DriverInfoFormCtrl($log, $q, $document, Drivers, auth) {
        var vm = this;

        vm.text = _.defaults(vm.text || {}, {
            about: null
        });

        vm.getSubforms = function (form) {
            var FormController;

            if (!!form.hasOwnProperty('$setSubmitted')) {
                FormController = form.constructor;
            }
            else {
                $log.debug('[Gateway.getSubforms] form is not a FormController');
                return [];
            }

            return _.compact(_.map(form, function (value, key, collection) {
                if (key.substring(0, 1) === '$') return;
                if (value instanceof form.constructor) return value;
            }));

        };

        vm.methods = _.defaults({
            submit: function () {
                var method;

                if (_.isEmpty(vm.driver._id)) {
                    vm.driver = new Drivers.ById(vm.driver);
                    return vm.driver.$save()
                        .then(function (updatedDriver) {
                            $log.debug('Successfully created DRIVER with details');

                            return (vm.gateway.driver = updatedDriver);
                        })
                        .catch(function (errorResponse) {
                            vm.error = errorResponse.data && errorResponse.data.message || 'Unable to create driver';
                            vm.loading = false;

                            return $q.reject(vm.error);
                        });
                }
                else {
                    return vm.driver.$update()
                        .then(function (updatedDriver) {
                            $log.debug('Successfully updated DRIVER with details');

                            return (vm.gateway.driver = updatedDriver);
                        })
                        .catch(function (errorResponse) {
                            vm.error = errorResponse.data && errorResponse.data.message || 'Unable to update driver';
                            vm.loading = false;

                            return $q.reject(vm.error);
                        });
                }
            },
            validate: function () {
                var deferred = $q.defer();

                vm.form.$setSubmitted(true);

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

            _.each(vm.getSubforms(vm.form), function (subform) {
                $log.debug('[ValidateSubforms.%s] Validating subform: %s', subform.$name, subform.$name);

                if (!subform.$submitted) {
                    $log.debug('[ValidateSubforms.%s] Setting to Submitted', subform.$name);
                    subform.$setSubmitted(true);
                }

                var subs = vm.getSubforms(subform);

                _.each(subs, function (doublesub) {
                    debugger;
                });
            });

            if (vm.form.experienceForm && vm.form.experienceForm.$pristine) {

                console.log('Experience untouched ...');
                if (vm.driver.experience[0] && vm.driver.experience[0].isFresh) {
                    console.log('nuked experience');
                    debugger;
                    vm.driver.experience.pop();
                }
                debugger;

                //vm.form.experienceForm.$setValidity('vm.form.experienceForm', true);
                //vm.form.experienceForm.$rollbackViewValue();

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
                if (!vm.form.introText.$valid) {
                    debugger;
                    vm.form.$setValidity('introText', true);
                }
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

        vm.methods.init && vm.methods.init();
    }

    DriverInfoFormCtrl.$inject = ['$log', '$q', '$document', 'Drivers', 'Authentication'];

    function DriverInfoFormDirective(Drivers) {
        return {
            templateUrl: function(elem, attrs) {
                switch(attrs.displayMode || 'full') {
                    case 'min': return '/modules/drivers/views/templates/driver-info-form.client.template.html';
                    default: return '/modules/drivers/views/templates/driver-edit-form.client.template.html';
                }

            } ,
            restrict: 'E',
            require: ['^form'],
            scope: {
                gateway: '=',
                user: '=?',
                driver: '=?model',
                text: '=?',
                methods: '=',
                displayMode: '=?'
            },
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];

                if (!!scope.vm.gateway) {
                    scope.vm.gateway.user.then(function (userResponse) {
                        scope.vm.user = userResponse;
                    });

                    scope.vm.gateway.driver.then(function (driverResponse) {
                        if (!_.isEmpty(scope.vm.driver)) {
                            debugger;
                        }
                        scope.vm.driver = _.merge(driverResponse, Drivers.default);
                    });
                }
            },
            controller: 'DriverInfoFormController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    DriverInfoFormDirective.$inject = ['Drivers'];

    angular.module('drivers')
        .controller('DriverInfoFormController', DriverInfoFormCtrl)
        .directive('driverInfoForm', DriverInfoFormDirective);
})();
