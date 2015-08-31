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
                type: '@?',
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
            vm.type = vm.type || 'driver';
        }

        vm.show = function () {
            var modalInstance = $modal.open({
                templateUrl: 'signupApplyModal.html',
                controller: 'SignupApplyController',
                size: 'lg',
                resolve: {
                    type: function () {
                        return vm.type;
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

    function SignupApplyController($http, $state, $modalInstance, $log, Authentication, type, job, $document, Drivers, ApplicationFactory) {
        var vm = this;

        vm.auth = Authentication;
        vm.job = job;
        vm.extraText = vm.job && vm.job.text || null;
        vm.currentStep = !!type ? 1 : 0;

        vm.applicant = vm.auth.user || {profileImageURL: ''};
        vm.credentials = {type: type};
        vm.application = {};

        vm.validateForm = function () {
            var stepForm = vm['subForm' + vm.currentStep];
            if (stepForm.$invalid) {
                _.map(_.keys(stepForm.$error), function (errorType) {
                    $log.debug('[SignupApply.validateForm] Form %d has error type: %s', vm.currentStep, errorType);
                    _.map(stepForm.$error[errorType], function (item) {
                        $log.debug('[SignupApply.validateForm] Item has error: %o', item);
                        if (!!item) {
                            item.$setDirty(true);
                        }
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

            var formMethods = vm['subform' + vm.currentStep + 'Methods'];

            formMethods.validate()
                .then(function(success) {
                    $log.debug('[SignupApplyModal] validated: %s', success);
                    return formMethods.submit();
                })
                .then(function (success) {
                    vm.applicant = success;
                    vm.currentStep++;
                })
                .catch(function (error) {
                    vm.error = error;
                })
                .finally(function () {
                    vm.loading = false;
                });
        };

        vm.createDriver = function() {

            vm.loading = true;
            var formMethods = vm['subform' + vm.currentStep + 'Methods'];

            formMethods.validate()
                .then(function(success) {
                    $log.debug('[SignupApplyModal] validated: %s', success);
                    return formMethods.submit();
                })
                .then(function (success) {
                    debugger;
                    vm.applicant = success;

                    vm.application.message = vm.applicant.about;
                    vm.currentStep++;
                })
                .catch(function (error) {
                    vm.error = error;
                })
                .finally(function () {
                    vm.loading = false;
                });
        };

        vm.userPicUploaded = function (fileItem, response) {
            // Populate user object
            debugger;
            vm.applicant = response;
            vm.imageURL = vm.applicant.profileImageURL;

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

    SignupApplyController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'type', 'job', '$document', 'Drivers', 'Applications'];
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
