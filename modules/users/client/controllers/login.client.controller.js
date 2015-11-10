(function () {
    'use strict';

    angular.module('users')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$state', '$modalInstance', '$log', 'Authentication', 'srefRedirect', 'LoginService'];
    function LoginController($state, $modalInstance, $log, Authentication, srefRedirect, LoginService) {
        var vm = this;
        vm.auth = Authentication;
        vm.srefRedirect = srefRedirect;

        vm.credentials = {};

        vm.signin = function signin() {

            var credentials = vm.credentials || this.credentials;

            LoginService.login(credentials)
                .then(function success(response) {
                    debugger;

                    if (!vm.auth.user) {
                        vm.auth.user = response;
                    }

                    if (!!$modalInstance && _.isFunction($modalInstance.close)) {
                        $modalInstance.close('success');
                    }

                    if (vm.srefRedirect) {
                        $state.go(vm.srefRedirect.state, vm.srefRedirect.params, { reload: true });
                    } else if (!$state.includes('intro')) {
                        $log.debug('currently at state `%s`, staying here and not redirecting home', $state.$current.name);
                        $state.go($state.current, {}, { reload: true });
                    } else {
                        $state.go('trucker');
                    }

                    if (vm.auth.isLoggedIn()) {
                        //Raygun.setUser(vm.auth.user.id, false, vm.auth.user.email, vm.auth.user.displayName);
                    }
                }).catch(function error(response) {
                    console.error(response.message || response);
                    vm.error = response.message || 'Unable to Login at this time. Please Check your Credentials';
                });
        };
    }
})();