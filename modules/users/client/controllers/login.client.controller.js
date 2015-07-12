(function () {
	'use strict';

	function LoginController($http, $state, $modalInstance, $log, Authentication, srefRedirect) {
        var vm = this;
        vm.auth = Authentication;
        vm.srefRedirect = srefRedirect;

        vm.credentials = {};

        vm.signin = function () {

            var credentials = vm.credentials || this.credentials;

            $http.post('/api/auth/signin', credentials)
                .success(function (response) {
                    // If successful we assign the response to the global user model
                    vm.auth.user = response;

                    $log.debug('Successfully logged in');

                    if (!!$modalInstance && _.isFunction($modalInstance.close)) {
                        $modalInstance.close('success');
                    }

                    if (vm.srefRedirect) {
                        $state.go(vm.srefRedirect.state, vm.srefRedirect.params, { reload: true });
                    } else if (!$state.includes('intro')) {
                        $log.debug('currently at state `%s`, staying here and not redirecting home', $state.$current.name);
                        $state.go($state.current, {}, { reload: true });
                    } else {
                        $state.go('home');
                    }

                    Raygun.setUser(vm.auth.user._id, false, vm.auth.user.email, vm.auth.user.displayName);
                }).error(function (response) {
                    console.error(response.message);
                    vm.error = response.message;
                });
        };
    }

    LoginController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'srefRedirect'];
	
    angular.module('users')
        .controller('LoginController', LoginController);
})();