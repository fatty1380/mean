/* global _ */
/* global logger */

(function() {
    'use strict';

    angular
        .module('lockbox')
        .controller('ResumeInfoCtrl', ResumeInfoCtrl);

    ResumeInfoCtrl.$inject = ['LoadingService', 'lockboxDocuments', 'parameters', 'profileModalsService', '$q', '$timeout', 'userService'];

    function ResumeInfoCtrl(Loader, LockboxDocuments, parameters, ProfileModals, $q, $timeout, UserService) {

        var vm = this;

        vm.apply = apply;

        var stages = [
            { name: 'Address', validator: validateAddress, resolver: fixAddress, status: null },
            { name: 'Experience', validator: validateExperience, resolver: fixExperience, status: null },
            { name: 'License', validator: validateLicense, resolver: fixLicense, status: null },
            { name: 'User', validator: validateUser, resolver: fixUser, status: null },
            { name: 'Confirm', hidden: true, validator: doConfirm, status: null }

        ];

        vm.validationMode = parameters.validationMode || 'view';

        vm.document = parameters.document;
        vm.validators = parameters.validators || stages;
        vm.user = parameters.user;
        vm.status = 'validating';


        vm.text = parameters.text || {};
        vm.requirements = parameters.requirements || {};

        _.defaults(vm.text, {
            experience: 'Please provide details about your past work experience to include in your resume'
        });

        if (vm.validationMode === 'view') {
            vm.requireAll = false;
        }
        else if (vm.validationMode === 'share') {
            vm.requireAll = true;

            vm.text.confirm = vm.text.confirm || 'Thank you for filling out your profile!';
        }

        _.defaults(vm.requirements, {
            experience: vm.requireAll ? 1 : false,
            address: vm.requireAll ? 1 : false,
            license: true
        });

        activate();

        // ///////////////////////////////////////////////////////////

        function activate() {

            var p = !_.isEmpty(vm.user) ? $q.resolve(vm.user) :
                UserService.getUserData()
                    .then(function(user) {
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

                    logger.debug(stageValidator.name + '] START');

                    // Use a promise to ensure that validators are not running concurrently
                    pending = pending.then(function() {

                        stageValidator.status = 'loading';
                        logger.debug(stageValidator.name + '] loading');

                        return stageValidator.validator(vm.user, vm.application)
                            .then(function handleSuccess() {
                                logger.debug(stageValidator.name + '] valid');
                                stageValidator.status = 'valid';
                            })
                            .catch(function HandleReject(reason) {
                                logger.debug(stageValidator.name + '] reject 1 - invalid: ' + reason);
                                stageValidator.reason = reason;

                                if (reason.note) {
                                    stageValidator.note = reason.note;
                                }

                                stageValidator.status = 'invalid';

                                return reason;

                            })
                            .then(function setupResolver(reason) {
                                if (!_.isFunction(stageValidator.resolver)) {
                                    logger.debug(stageValidator.name + '] no resolver - no-action');
                                    vm.reason = reason;
                                    return reason;
                                }

                                logger.debug(stageValidator.name + '] Configuring Resolver');

                                stageValidator.action = function resolveStage() {

                                    stageValidator.status = 'loading';

                                    logger.debug(stageValidator.name + '] Triggering Resolver');
                                    stageValidator.resolver(vm.user, vm.application, stageValidator.reason)
                                        .then(function resolved(result) {
                                            logger.debug('Validator Resolver Result: ', result);
                                            return stageValidator.validator(vm.user, vm.application);
                                        })
                                        .then(function resolved(result) {
                                            stageValidator.note = null;
                                            stageValidator.status = 'valid';
                                            return result;
                                        })
                                        .catch(function failed(err) {
                                            stageValidator.reason = err;
                                            if (err && err.note) {
                                                stageValidator.note = err.note;
                                            }
                                            stageValidator.status = 'invalid';
                                        });
                                };
                            });
                    });
                });

                return pending
                    .then(function finalSuccess(result) {
                        logger.debug('Validators] Complete : Valid', result);
                        vm.status = 'valid';
                    })
                    .catch(function finalFailed(err) {
                        logger.debug('Validators] Complete : InValid', err);
                        vm.status = 'invalid';
                    });
            });

        }

        /** Validators and Fixers */

        function validateUser() {
            return $timeout(_.noop, 1000);
        }

        function fixUser() {
            return ProfileModals
                .showProfileEditModal()
                .then(function success(result) {
                    _.extend(vm.user, result);
                });
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
            return $q(function(resolve) {
                $timeout(function() {
                    resolve({ field: 'address', result: 'valid' });
                }, 250);
            });
        }

        function fixAddress(user) {
            return ProfileModals
                .showProfileEditAddressModal({ address: user.address })
                .then(function success(result) {
                    vm.user.address = result.address;
                    vm.user.addresses = result.addresses;
                });
        }

        function validateExperience(user) {

            var minLength = Number(vm.requirements.experience);

            if (_.isArray(user.experience) && user.experience.length >= minLength) {
                return $timeout(_.noop, 500);
            }

            var d = $q.defer();
            $timeout(function reject() {
                d.reject({ field: 'experience', reason: 'required', min: minLength });
            }, 250);
            return d.promise;
        }

        function fixExperience(user) {
            return ProfileModals
                .showListExperienceModal({ experience: user.experience, instructText: vm.text.experience })
                .then(function success(experience) {
                    vm.user.experience = experience;
                });
        }

        function validateLicense(user) {

            return $q(function(resolve, reject) {
                $timeout(function licenseValidation() {
                    if (!vm.requirements.license) {
                        return resolve();
                    }

                    if (_.isEmpty(user.license) || _.isEmpty(user.license.class)) {
                        return reject({ field: 'license', reason: 'required' });
                    }

                    var note;

                    if (vm.requirements.licenseClass) {
                        var licenseClass = (user.license.class || ' ').toLowerCase().charAt(0);
                        var requiredClass = vm.requirements.licenseClass.toLowerCase();

                        // License class will be in [a,b,c,d,standard,null];
                        if (licenseClass > requiredClass) {
                            note = 'This job requires a Class ' + requiredClass.toUpperCase() + ' license';
                            return reject({ field: 'license', reason: 'insufficient', note: note });
                        }
                    }

                    if (vm.requirements.licenseEndorsements) {
                        var licenseEndorsements = _.map(user.license.endorsements || [], toLower);
                        var requiredEndorsements = _.map(vm.requirements.licenseEndorsements, toLower); // eg: ['X']

                        var missing = [];

                        _.each(requiredEndorsements, function(e) {
                            if (!_.contains(licenseEndorsements, e)) {
                                missing.push(e.toUpperCase());
                            }
                        });

                        if (missing.length) {
                            note = 'This job requires the following license endorsements: ' + missing.join(', ');

                            return reject({ field: 'license', reason: 'insufficient', note: note });
                        }
                    }

                    return resolve();

                }, 250);
            });

        }

        function toLower(string) {
            return string.toLowerCase();
        }

        function fixLicense(user, application, reason) {
            return ProfileModals
                .showProfileEditLicenseModal({ license: user.license, note: reason && reason.note })
                .then(function success(license) {
                    logger.debug('Updated License to ', license);
                    vm.user.license = license;
                });
        }

        function doConfirm() {
            return $q(function(resolve) {
                $timeout(function reject() {
                    resolve(true);
                }, 250);
            });
        }

        function apply() {
            vm.loading = true;

            Loader.showLoader('Generating Resume');

            LockboxDocuments.refreshUserResume()
                .then(function processRefreshedResume(newResume) {
                    debugger;
                    Loader.showSuccess('Resume Generation Complete');

                    vm.closeModal(newResume);
                })
                .finally(function () { vm.loading = false; });
        }
    }
})();
