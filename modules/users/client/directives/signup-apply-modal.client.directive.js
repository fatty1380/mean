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

    function SignupApplyController($http, $state, $modalInstance, $log, Authentication, signupType, srefRedirect, $document) {
        var vm = this;

        vm.auth = Authentication;
        vm.srefRedirect = srefRedirect;
        vm.extraText = vm.srefRedirect && vm.srefRedirect.text || null;
        vm.currentStep = 0;


        vm.credentials = {signupType: signupType, terms: ''};
        vm.driver = {experience: [], licenses: [{}], interests: []};
        vm.application = {};

        vm.nextStep = function (event) {
            var stepForm = vm['subForm' + vm.currentStep];
            if (stepForm.$invalid) {
                _.map(stepForm.$error, function (errorType) {
                    _.map(errorType, function (item) {
                        item.$setDirty(true);
                    });
                });
                vm.error = 'please correct the errors above';
                return;
            }

            vm.error = null;
            vm.currentStep++;
        };

        vm.prevStep = function () {
            vm.currentStep--;
        };

        vm.signup = function (event) {

            if (!vm.credentials.terms) {
                vm.error = 'Please agree to the terms and conditions before signing up';
                event.preventDefault();
                return false;
            }

            if (vm.credentials.password !== vm.credentials.confirmPassword) {
                $log.debug('passwords do not match, yo!');
                vm.error = 'Passwords to not match. Please enter them again';
                return false;
            }

            if (vm.signupForm.$invalid) {
                vm.error = 'Please fill in all fields above';
                return false;
            }

            $log.debug('assigning email to username');
            vm.credentials.username = vm.credentials.email;
            vm.credentials.type = vm.credentials.signupType;

            $http.post('/api/auth/signup', vm.credentials)
                .success(function (response) {
                    // If successful we assign the response to the global user model
                    vm.auth.user = response;

                    $log.debug('Successfully created %o USER Profile', response.type);

                    $modalInstance.close(response.type);

                    if ($state.is('jobs.view') && response.type === 'driver') {
                        $log.debug('New Driver currently at state `%s`, Redirecting to home', $state.$current.name);
                        $state.go('drivers.home', {newUser: true}, {reload: true});
                    } else if (vm.srefRedirect) {
                        $state.go(vm.srefRedirect.state, vm.srefRedirect.params, {reload: true});
                    } else if (!$state.is('jobs.view') && response.type === 'driver') {
                        $log.debug('New Driver currently at state `%s`, Redirecting to home', $state.$current.name);
                        $state.go('drivers.home', {newUser: true}, {reload: true});
                    } else if (!$state.is('intro')) {
                        $log.debug('currently at state `%s`, staying here and not redirecting home', $state.$current.name);
                        $state.go($state.current, {newUser: true}, {reload: true});
                    } else {
                        $state.go('home');
                    }
                }).error(function (response) {
                    console.error(response.message);
                    vm.error = response.message;
                });
        };
    }

    SignupApplyController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'signupType', 'srefRedirect', '$document'];
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
