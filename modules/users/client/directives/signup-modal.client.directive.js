(function() {
    'use strict';

    function SignupModalDirective() {
        return {
            transclude: true,
            templateUrl: 'modules/users/views/templates/signup-modal.client.template.html',
            restrict: 'EA',
            scope: {
                signin: '&',
                title: '@?',
                signupType: '@?'
            },
            controller: 'SignupModalController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function SignupModalController($modal, $log) {
        var vm = this;

        vm.isOpen = false;

        vm.showSignup = function() {
            var modalInstance = $modal.open({
                templateUrl: 'signupModal.html',
                controller: 'SignupController',
                size: 'lg',
                resolve: {
                    signupType: function() { return vm.signupType; }
                },
                controllerAs: 'vm'
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

    function SignupController($http, $state, $modalInstance, $log, Authentication, signupType, $scope) {
        var vm = $scope.vm = this;
        vm.auth = Authentication;
        vm.credentials = { signupType: signupType, terms: '' };

        vm.hello = 'HELLO';

        vm.signup = function() {

            $log.debug('[Auth.Ctrl.signup] signing up with credentials: ', vm.credentials);

            $log.debug('assigning email to username');
            vm.credentials.username = vm.credentials.email;

            $http.post('/api/auth/signup', vm.credentials)
                .success(function(response) {
                    // If successful we assign the response to the global user model
                    vm.auth.user = response;

                    $log.debug('Successfully created %o USER Profile', response.type);

                    $modalInstance.close(response.type);

                    $state.go('home');
                }).error(function(response) {
                    console.error(response.message);
                    vm.error = response.message;
                });
        };
    }

    SignupController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'signupType', '$scope'];
    SignupModalController.$inject = ['$modal', '$log'];

    angular.module('users')
        .directive('signupModal', SignupModalDirective)
        .controller('SignupModalController', SignupModalController)
        .controller('SignupController', SignupController);

})();
