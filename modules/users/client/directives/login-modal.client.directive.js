(function () {
    'use strict';

    function LoginModalDirective() {
        return {
            transclude: true,
            templateUrl: '/modules/users/views/templates/login-modal.client.template.html',
            restrict: 'EA',
            scope: {
                signin: '&',
                title: '@?',
                srefText: '@?',
                job: '=?',
                redirect: '=?'
            },
            controller: 'LoginModalController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function LoginModalController($scope, $modal, $log, $attrs) {
        var vm = this;

        vm.isOpen = false;

        if (angular.isDefined($attrs.redirect)) {
            $log.debug('using existing redirect: %o', vm.redirect);
            vm.redirect = vm.redirect;
        }
        else if (angular.isDefined($attrs.job)) {
            vm.redirect = {
                state: 'jobs.view',
                params: {jobId: vm.job && vm.job.id},
                text: vm.srefText
            };
        }

        vm.showLogin = function () {
            var modalInstance = $modal.open({
                templateUrl: 'loginModal.html',
                controller: 'LoginController',
                resolve: {
                    srefRedirect: function () {
                        return vm.redirect;
                    }
                },
                controllerAs: 'vm',
                bindToController : true
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

                    $modalInstance.close('success');

                    if (vm.srefRedirect) {
                        $state.go(vm.srefRedirect.state, vm.srefRedirect.params, {reload: true});
                    } else if (!$state.includes('intro')) {
                        $log.debug('currently at state `%s`, staying here and not redirecting home', $state.$current.name);
                        $state.go($state.current, {}, {reload: true});
                    } else {
                        $state.go('home');
                    }

                    debugger;
                    Raygun.setUser(vm.auth.user._id, false, vm.user.email, vm.user.displayName);
                }).error(function (response) {
                    console.error(response.message);
                    vm.error = response.message;
                });
        };
    }

    LoginController.$inject = ['$http', '$state', '$modalInstance', '$log', 'Authentication', 'srefRedirect'];


    LoginModalController.$inject = ['$scope', '$modal', '$log', '$attrs'];

    angular.module('users')
        .directive('loginModal', LoginModalDirective)
        .controller('LoginController', LoginController)
        .controller('LoginModalController', LoginModalController);

})();
