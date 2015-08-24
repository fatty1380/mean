(function () {
    'use strict';

    function LoginController($http, $state, $modalInstance, $log, Authentication, srefRedirect, AuthService) {
        var vm = this;
        vm.auth = Authentication;
        vm.srefRedirect = srefRedirect;

        vm.credentials = {};

        vm.signin = function () {

            var credentials = vm.credentials || this.credentials;

            AuthService.login(credentials)
                .then(function success(response) {
                    debugger;

                    if (!vm.auth.user) {
                        debugger;
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
                        $state.go('home');
                    }

                    if (vm.auth.isLoggedIn()) {
                        Raygun.setUser(vm.auth.user.id, false, vm.auth.user.email, vm.auth.user.displayName);
                    }
                }).catch(function error(response) {
                    console.error(response.message || response);
                    vm.error = response.message;
                });
        };
    }

    LoginController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'srefRedirect', 'LoginService'];

    angular.module('users')
        .controller('LoginController', LoginController);
})();