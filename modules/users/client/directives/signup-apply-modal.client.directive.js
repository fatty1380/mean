(function () {
    'use strict';

    function SignupApplyModalDirective() {
        var ddo;
        ddo = {
            transclude: true,
            templateUrl: 'modules/users/views/templates/signup-apply.client.template.html',
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
            vm.redirect = {
                state: 'jobs.view',
                params: {jobId: vm.job.id},
                text: vm.srefText
            };
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
                    srefRedirect: function () {
                        return vm.redirect;
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

        // TODO: Remove Auto-show
        vm.show();
    }

    function SignupApplyController($http, $state, $modalInstance, $log, Authentication, signupType, srefRedirect, $document, Drivers) {
        var vm = this;

        vm.auth = Authentication;
        vm.srefRedirect = srefRedirect;
        vm.extraText = vm.srefRedirect && vm.srefRedirect.text || null;
        vm.currentStep = 1;


        vm.user = {profileImageURL: ''}
        vm.credentials = {signupType: signupType, terms: ''};
        vm.driver = {resume: {}, experience: [{}], licenses: [{}], interests: []};
        vm.application = {};

        vm.validateForm = function() {
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
        }

        vm.nextStep = function () {
            if(vm.validateForm()) {
                vm.currentStep++;
            }
        };

        vm.prevStep = function () {
            vm.currentStep--;
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

            if(!vm.validateForm()) {
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

                    debugger;

                    if(typeof vm.auth.user.driver === 'string') {
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

        vm.saveDriverDetails = function() {
            vm.loading = true;

            if(!vm.validateForm()) {
                vm.error = 'Please fill in all fields above';
                vm.loading = false;
                return false;
            }

            var rsrc = Drivers.ById.get({
                driverId: vm.driver._id
            }).$promise.then(function(success) {
                    $log.debug('Loaded full Driver Profile from server: %o', success);
                    vm.driver = _.defaults(vm.driver, success);

                    // {resume: {}, experience: [{}], licenses: [{}], interests: []}
                    success.resume = vm.driver.resume;
                    success.experience = vm.driver.experience;
                    success.licenses = vm.driver.licenses;
                    success.interests = vm.driver.interests;

                    success.$update(function (response) {
                        debugger;
                        vm.user.driver = vm.driver = response;

                        $log.debug('Successfully updated DRIVER with details');

                        vm.loading = false;
                        vm.currentStep++;

                    }, function (errorResponse) {
                        vm.error = errorResponse.data.message;
                        vm.loading = false;
                    });
                });
        }

        vm.userPicUploaded = function (fileItem, response, status, headers) {
            // Populate user object
            debugger;
            vm.user = response;
            vm.imageURL = vm.user.profileImageURL;

            Authentication.user.profileImageURL = response.profileImageURL;
        };

        vm.about = {
            zip: 'Your zip code will be used to help improve your experience on the site',
            password: 'A password will be required in order to see the status of your application and communicate with the employer.'
        }
    }

    SignupApplyController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'signupType', 'srefRedirect', '$document', 'Drivers'];
    SignupApplyModalController.$inject = ['$modal', '$log', '$attrs'];

    angular.module('users')
        .controller('SignupApplyModalController', SignupApplyModalController)
        .controller('SignupApplyController', SignupApplyController)
        .directive('osetSignupApplyModal', SignupApplyModalDirective);

    function DebounceDirective() {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, controller) {
                if (!controller.$options) {
                    controller.$options = {
                        updateOn : 'default blur',
                        debounce : {
                            'default' : 3000,
                            'blur' : 0
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
