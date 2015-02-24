(function () {
    'use strict';

    function SignupApplyModalDirective() {
        var ddo;
        ddo = {
            transclude: true,
            templateUrl: '/modules/users/views/templates/signup-apply.client.template.html',
            restrict: 'EA',
            scope: {
                signin: '&?',
                title: '@?',
                signupType: '@?',
                srefText: '@?',
                job: '=?'
            },
            controller: 'SignupApplyModalController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function SignupApplyModalController($modal, $log, $attrs) {
        var vm = this;

        vm.isOpen = false;

        if (angular.isDefined($attrs.job)) {
            vm.signupType = vm.signupType || 'driver';
        }

        vm.show = function () {
            var modalInstance = $modal.open({
                templateUrl: 'signupApplyModal.html',
                controller: 'SignupApplyController',
                size: 'lg',
                resolve: {
                    signupType: function () {
                        return vm.signupType;
                    },
                    job: function () {
                        return vm.job;
                    }
                },
                controllerAs: 'vm',
                bindToController: true
            });

            modalInstance.result.then(function (result) {
                $log.info('Modal result %o', result);
                vm.isOpen = false;
            }, function (result) {
                $log.info('Modal dismissed at: ' + new Date());
                vm.isOpen = false;
            });

            modalInstance.opened.then(function (args) {
                vm.isOpen = true;
            });
        };
    }

    function SignupApplyController($http, $state, $modalInstance, $log, Authentication, signupType, job, $document, Drivers, ApplicationFactory) {
        var vm = this;

        vm.auth = Authentication;
        vm.job = job;
        vm.extraText = vm.job && vm.job.text || null;
        vm.currentStep = !!signupType ? 1 : 0;

        vm.user = vm.auth.user || {profileImageURL: ''};
        vm.credentials = {signupType: signupType, terms: '', addresses: [{}]};
        vm.driver = vm.user.driver || {resume: {}, experience: [{}], licenses: [{}], interests: []};
        vm.application = {};

        vm.validateForm = function () {
            var stepForm = vm['subForm' + vm.currentStep];
            if (stepForm.$invalid) {
                _.map(stepForm.$error, function (errorType) {
                    _.map(errorType, function (item) {
                        item.$setDirty(true);
                    });
                });
                vm.error = 'please correct the errors above';
                vm.loading = false;
                return false;
            }

            vm.error = null;
            return true;
        };

        vm.nextStep = function () {
            if (vm.validateForm()) {
                vm.currentStep++;
            }
        };

        vm.prevStep = function () {
            vm.currentStep--;
        };

        vm.selectUserType = function (userType) {
            vm.credentials.signupType = userType;

            if (!vm.validateForm()) {
                vm.error = 'Please select what type of user best describes you';
                vm.loading = false;
                return false;
            }

            vm.error = vm.success = null;
            vm.loading = false;
            vm.currentStep++;
        };

        vm.createUser = function (event) {
            vm.loading = true;

            if (!vm.credentials.terms) {
                vm.error = 'Please agree to the terms and conditions before signing up';
                event.preventDefault();
                vm.loading = false;
                return false;
            }

            if (vm.credentials.password !== vm.credentials.confirmPassword) {
                $log.debug('passwords do not match, yo!');
                vm.error = 'Passwords to not match. Please enter them again';
                vm.loading = false;
                return false;
            }

            if (!vm.validateForm()) {
                vm.error = 'Please fill in all fields above';
                vm.loading = false;
                return false;
            }

            $log.debug('assigning email to username');
            vm.credentials.username = vm.credentials.email;
            vm.credentials.type = vm.credentials.signupType;

            $http.post('/api/auth/signup', vm.credentials)
                .success(function (response) {
                    // If successful we assign the response to the global user model
                    vm.user = vm.auth.user = response;

                    if (typeof vm.auth.user.driver === 'string') {
                        vm.driver._id = vm.auth.user.driver;
                    } else {
                        vm.driver = _.extend(vm.driver, vm.auth.user.driver);
                    }

                    $log.debug('Successfully created %o USER Profile', response.type);

                    vm.loading = false;
                    vm.currentStep++;
                }).error(function (response) {
                    console.error(response.message);
                    vm.loading = false;
                    vm.error = response.message;
                });
        };

        vm.saveDriverDetails = function () {

            debugger;
            if(!vm.validateDriver()) {
                return false;
            }

            Drivers.ById.get({
                driverId: vm.driver._id
            }).$promise.then(function (existingDriver) {
                    $log.debug('Loaded full Driver Profile from server: %o', existingDriver);
                    debugger;
                    existingDriver.experience = vm.driver.experience;
                    existingDriver.interests = vm.driver.interests;
                    existingDriver.licenses = vm.driver.licenses;
                    existingDriver.about = vm.driver.about;

                    existingDriver.$update(function (updatedDriver) {
                        debugger;
                        vm.driver = vm.user.driver = updatedDriver;

                        $log.debug('Successfully updated DRIVER with details');

                        debugger;
                        vm.application.message = vm.driver.about;

                        vm.loading = false;
                        vm.currentStep++;

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                        vm.loading = false;
                    });
                });
        };

        vm.validateDriver = function() {
            if(!vm.driver._id) {
                vm.error = vm.error || 'please create a new user before continuing';

                vm.currentStep = 1;

                return false;
            }

            var validity = vm.validateDriverSubForms();

            if (!vm.validateForm()) {
                vm.error = vm.error || 'Please fill in all fields above';
                vm.loading = false;
                validity = false;
            }

            return (vm.loading = validity);

        };

        vm.validateDriverSubForms = function() {

            vm.subForm2.$setSubmitted(true);

            vm.licenseForm = vm.subForm2['vm.licenseForm'];
            if (!!vm.licenseForm) {
                vm.licenseForm.$setSubmitted(true);
            }

            vm.experienceForm = vm.subForm2['vm.experienceForm'];
            if(!!vm.experienceForm) {
                vm.experienceForm.$setSubmitted(true);
            }

            if (vm.experienceForm && vm.experienceForm.$pristine) {

                console.log('Experience untouched ...');
                if (vm.driver.experience[0] && vm.driver.experience[0].isFresh) {
                    console.log('nuked experience');
                    vm.driver.experience = [];
                }
                vm.subForm2.$setValidity('vm.experienceForm', true);

            }

            if (vm.subForm2.$invalid) {
                if (vm.subForm2.$error.required) {
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

        vm.userPicUploaded = function (fileItem, response) {
            // Populate user object
            debugger;
            vm.user = response;
            vm.imageURL = vm.user.profileImageURL;

            Authentication.user.profileImageURL = response.profileImageURL;
        };

        // Create new Application
        vm.createApplication = function () {

            if (vm.validateApplication(true)) {

                $log.debug('[AppController.create]', 'Creating new Application');
                // Create new Application object
                var application = new ApplicationFactory.ByJob({
                    status: 'submitted',
                    agreement: vm.application.termsAccepted

                });

                application.jobId = vm.job && vm.job._id && (vm.job._id);
                application.introduction = vm.application.message;
                application.agreement = vm.application.termsAccepted;

                // Redirect after save
                application.$save(function (response) {
                    // Clear form fields

                    $modalInstance.close(response._id);
                    $state.go('applications.view', {applicationId: response._id});
                }, function (errorResponse) {
                    vm.error = errorResponse.data.message;
                });
            }
        };

        vm.validateApplication = function (termsRequired) {

            if (!vm.job || !vm.job._id) {
                vm.error = vm.about.errors.noJob;
                return false;
            }

            if (termsRequired && !vm.application.termsAccepted) {
                vm.error = vm.about.errors.terms;
                return false;
            }

            if (vm.picIsEditing) {
                vm.error = vm.about.errors.picEdit;
                return false;
            }

            if (!vm.validateForm()) {
                if (!vm.application.message) {
                    vm.error = vm.about.errors.noMessage;
                }
                else {
                    vm.error = 'Please correct the errors above in order to submit your application';
                }

                return false;
            }

            return true;
        };

        vm.about = {
            zip: 'Your zip code will be used to help improve your experience on the site',
            password: 'A password will be required in order to see the status of your application and communicate with the employer.',
            messageSubHeading: null,
            disclaimer: '<strong>Terms:</strong> By Applying for this job you consent to this employer reviewing your personal information, including: Your Profile, Resume, Background Check, Motor Vehicle Report & Drug Test, (If items are present in your profile). Outset is not responsible for the hiring decision of this employer, any and all hiring actions, including rejection of applicant, are the responsibility of the employer and the applicant.',
            errors: {
                noJob: 'You must select a job to apply to first, or you can save as a draft',
                noMessage: 'Please enter a message to the employer before submitting your application',
                terms: 'You must accept the terms before submitting your application',
                picEdit: 'Please complete editing your picture before continuing'
            }
        };
    }

    SignupApplyController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'signupType', 'job', '$document', 'Drivers', 'Applications'];
    SignupApplyModalController.$inject = ['$modal', '$log', '$attrs'];

    angular.module('users')
        .controller('SignupApplyModalController', SignupApplyModalController)
        .controller('SignupApplyController', SignupApplyController)
        .directive('osetSignupApplyModal', SignupApplyModalDirective);

    function DebounceDirective() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, controller) {
                if (!controller.$options) {
                    controller.$options = {
                        updateOn: 'default blur',
                        debounce: {
                            'default': 3000,
                            'blur': 0
                        },
                        updateOnDefault: true
                    };
                }
            }
        };
    }

    //ng-model-options="{ updateOn: 'default blur', debounce: { 'default': 300, 'blur': 0 } }">


    angular.module('core')
        .directive('debounce', DebounceDirective);

})();
