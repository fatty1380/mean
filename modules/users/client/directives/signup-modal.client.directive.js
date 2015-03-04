(function() {
    'use strict';

    function SignupModalDirective() {
        return {
            transclude: true,
            templateUrl: '/modules/users/views/templates/signup-modal.client.template.html',
            restrict: 'EA',
            scope: {
                signin: '&',
                title: '@?',
                signupType: '@?',
                srefText: '@?',
                job: '=?'
            },
            controller: 'SignupModalController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function SignupModalController($modal, $log, $attrs) {
        var vm = this;

        vm.isOpen = false;

        if(angular.isDefined($attrs.job)) {
            vm.redirect = {
                state : 'jobs.view',
                params: { jobId : vm.job && vm.job.id },
                text: vm.srefText
            };
        }

        vm.showSignup = function() {
            var modalInstance = $modal.open({
                templateUrl: 'signupModal.html',
                controller: 'SignupController',
                size: 'lg',
                resolve: {
                    signupType: function() { return vm.signupType; },
                    srefRedirect: function() { return vm.redirect; }
                },
                controllerAs: 'vm',
                bindToController: true
            });

            modalInstance.result.then(function(result) {
                $log.info('Modal result %o', result);
                vm.isOpen = false;
            }, function(result) {
                $log.info('Modal dismissed at: ' + new Date());
                vm.isOpen = false;
            });

            modalInstance.opened.then(function(args) {
                vm.isOpen = true;
            });
        };
    }

    function SignupController($http, $state, $modalInstance, $log, Authentication, signupType, srefRedirect, $document) {
        var vm = this;
        vm.auth = Authentication;
        vm.credentials = { signupType: signupType, terms: '' };
        vm.srefRedirect = srefRedirect;

        vm.extraText = vm.srefRedirect && vm.srefRedirect.text  || null;

        vm.selectType = function(type, $event) {
            vm.credentials.signupType = type;
            $document.scrollTopAnimated(0, 300);
        };

        vm.signup = function(event) {

            if(!vm.credentials.terms) {
                vm.error = 'Please agree to the terms and conditions before signing up';
                event.preventDefault();
                return false;
            }

            if(vm.credentials.password !== vm.credentials.confirmPassword) {
                $log.debug('passwords do not match, yo!');
                vm.error = 'Passwords to not match. Please enter them again';
                return false;
            }

            if(vm.signupForm.$invalid) {
                vm.error = 'Please fill in all fields above';
                return false;
            }

            $log.debug('assigning email to username');
            vm.credentials.username = vm.credentials.email;
            vm.credentials.type = vm.credentials.signupType;

            $http.post('/api/auth/signup', vm.credentials)
                .success(function(response) {
                    // If successful we assign the response to the global user model
                    vm.auth.user = response;

                    $log.debug('Successfully created %o USER Profile', response.type);

                    $modalInstance.close(response.type);

                    if ($state.is('jobs.view') && response.type === 'driver') {
                        $log.debug('New Driver currently at state `%s`, Redirecting to home', $state.$current.name);
                        $state.go('drivers.home', {newUser: true}, {reload: true});
                    } else if(vm.srefRedirect) {
                        $state.go(vm.srefRedirect.state, vm.srefRedirect.params, {reload: true});
                    } else if (!$state.is('jobs.view') && response.type === 'driver') {
                        $log.debug('New Driver currently at state `%s`, Redirecting to home', $state.$current.name);
                        $state.go('drivers.home', {newUser: true}, {reload: true});
                    } else if (!$state.includes('intro')) {
                        $log.debug('currently at state `%s`, staying here and not redirecting home', $state.$current.name);
                        $state.go($state.current, {newUser: true}, {reload: true});
                    } else {
                        $state.go('home');
                    }

                    Raygun.setUser(vm.auth.user._id, false, vm.user.email, vm.user.displayName);
                }).error(function(response) {
                    console.error(response.message);
                    vm.error = response.message;
                });
        };
    }

    SignupController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'signupType', 'srefRedirect', '$document'];
    SignupModalController.$inject = ['$modal', '$log', '$attrs'];

    angular.module('users')
        .directive('signupModal', SignupModalDirective)
        .controller('SignupModalController', SignupModalController)
        .controller('SignupController', SignupController);

})();
