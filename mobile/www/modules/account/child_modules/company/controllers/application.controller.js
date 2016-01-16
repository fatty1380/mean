/* global _ */
/* global logger */

(function () {
    'use strict';


    angular
        .module('company')
        .filter('capitalize', function () {
            return function (input, scope) {
                if (input != null) {
                    input = input.toLowerCase();
                }
                return input.substring(0, 1).toUpperCase() + input.substring(1);
            };
        });

    angular
        .module('company')
        .controller('JobApplicationCtrl', JobApplicationCtrl);

    JobApplicationCtrl.$inject = ['$state', '$q', '$timeout', 'parameters', 'userService', 'profileModalsService', 'CompanyService', 'LoadingService'];

    function JobApplicationCtrl($state, $q, $timeout, parameters, UserService, ProfileModals, CompanyService, Loader) {

        var vm = this;

        vm.apply = apply;

        var stages = [
            { name: 'User', validator: validateUser, resolver: null, status: null },
            { name: 'Address', validator: validateAddress, resolver: fixAddress, status: null },
            { name: 'Experience', validator: validateExperience, resolver: fixExperience, status: null },
            { name: 'Props', validator: validateProps, resolver: fixProps, status: null },
            { name: 'Confirm', validator: doConfirm, status: null },

        ];

        vm.validators = parameters.validators || stages;
        vm.job = parameters.job;
        vm.user = parameters.user;
        vm.application = {};
        vm.status = 'validating';

        vm.text = vm.job.props && vm.job.props.text || {};
        vm.requirements = vm.job.props && vm.job.props.requirements || {};

        _.defaults(vm.text, {
            experience: 'Please provide details about your past work experience as part of your application',
            confirm: 'This will send an application, including all relevant profile data to the company, who will reach out to you via phone or email if you meet the criteria for the job.'
        });

        _.defaults(vm.requirements, {
            experience: 1,
            address: 1
        });

        activate();
        
        /////////////////////////////////////////////////////////////
        
        function activate() {
            if (_.isEmpty(vm.job)) {
                logger.error('No Job has been loaded into the Controller', parameters);
                return vm.close();
            }

            var p = !_.isEmpty(vm.user) ? $q.resolve(vm.user) :
                UserService.getUserData()
                    .then(function (user) {
                        vm.user = user;
                    });
                
            /**
             * Validation Lifecycle:
             * 1. null
             * 2. loading
             * 3. success: 'valid'
             *    failure: 'invalid' || fix && goto(2)
             * 
             * Each validation step first runs the validator, and if it passes, it sets
             * its status to 'valid' and continues. However, if it fails, *and* there is
             * a resolver defined on that step, it will attempt to resolve the issue. 
             * Once the resolver returns, the validator is run one more time, and will result
             * either succeed, set its status to 'valid', or fail, set its status to 'failed',
             * and exit out of the validation cycle. If that step had *no* resolver defined,
             * it would immedately jump to the 'failed' state and exit out of the cycle.
             * 
             * Depending on the output of the validation lifecycle, the overall status will be
             * set to either 'valid' or 'failed' depending respectively on whether the 
             * validation resolved or was rejected..
             */

            p.then(function processValidation() {

                // Initialize the promise to true to kiskstart the process
                var pending = $q.when(true);

                _.each(vm.validators, function processStage(stageValidator) {

                    // Use a promise to ensure that validators are not running concurrently
                    pending = pending.then(function (previousResult) {

                        stageValidator.status = 'loading';
                        return stageValidator.validator(vm.user, vm.application)
                            .then(function handleSuccess(success) {
                                stageValidator.status = 'valid';
                            })
                            .catch(function HandleReject(reason) {

                                stageValidator.status = 'invalid';

                                if (!_.isFunction(stageValidator.resolver)) {
                                    vm.reason = reason;
                                    throw reason;
                                }

                                var deferred = $q.defer();

                                stageValidator.action = function resolveStage() {
                                    stageValidator.action = null;
                                    stageValidator.status = 'loading';
                                    stageValidator.resolver(vm.user, vm.application)
                                        .then(function resolved(result) {
                                            return stageValidator.validator(vm.user, vm.application);
                                        })
                                        .then(function resolved(result) {
                                            stageValidator.status = 'valid';
                                            deferred.resolve(result);
                                        })
                                        .catch(function failed(err) {
                                            stageValidator.status = 'failed';
                                            deferred.reject(err);
                                        });
                                };

                                return deferred.promise;

                            });
                    });
                });

                pending
                    .then(function finalSuccess(result) {
                        vm.status = 'valid';
                    })
                    .catch(function finalFailed(err) {
                        vm.status = 'invalid';
                    });
            });

        }
        
        /** Validators and Fixers */

        function validateUser(user, application) {
            return $timeout(_.noop, 1000);
        }

        function fixUser() {

        }

        function validateAddress(user) {

            if (_.isEmpty(user.address)) {
                return $q.reject('Address is Required');
            }

            var a = _.extend({ streetAddresses: [] }, user.address);

            var sa = a.streetAddresses.join('').trim();
            var addr = [sa, a.zipCode, a.state, a.city].join('').trim();

            if (_.isEmpty(addr)) {
                return $q.reject({ field: 'address', reason: 'required' });
            }

            if (_.isEmpty(sa) || (_.isEmpty(a.zipCode) && _.isEmpty(a.city))) {
                return $q.reject({ field: 'address', reason: 'incomplete' });
            }


            return $timeout(function () {
                $q.resolve({ field: 'address', result: 'valid' });
            }, 500);
        }

        function fixAddress(user) {
            return ProfileModals
                .showProfileEditAddressModal({ address: user.address })
                .then(function success(result) {

                    vm.user.address = result.address;
                    vm.user.addresses = result.addresses;
                });
        }

        var expFixed = false;

        function validateExperience(user, application) {

            var minLength = Number(vm.requirements.experience);

            if (_.isArray(user.experience) && user.experience.length >= minLength) {
                return $timeout(_.noop, 500);
            }

            return $timeout(function reject() {
                $q.reject({ field: 'experience', reason: 'required', min: minLength });
            }, 100);
        }

        function fixExperience(user, application) {
            return ProfileModals
                .showListExperienceModal({ experience: user.experience, instructText: vm.text.experience })
                .then(function success(experience) {
                    debugger;
                    vm.user.experience = experience;
                    expFixed = true;
                });
        }

        function validateProps(user, application) {
            return $timeout(_.noop, 2000);
        }

        function fixProps() {

        }

        function doConfirm(user, application) {
            return $q.when(true);
        }

        function apply() {
            vm.loading = true;

            Loader.showLoader('Processing Application');

            CompanyService.applyToJob(vm.job.id)
                .then(function handleSuccess(application) {
                    logger.info('Applied to Job Successfully!!!', application);
                    vm.disableApplication = true;
                    return Loader.showSuccess('Application Successful!<br><small>Thanks for applying with Core-Mark</small>');

                })
                .catch(function handleError(error) {
                    logger.error('Job Application failed', error);
                    vm.loading = false;
                    return Loader.showFailure('Application Failed<br><small>Please try again later</small>');

                })
                .finally(vm.closeModal);
        }
        
        //////////////////////////////////////////////////////////////////////////////
    }
})();