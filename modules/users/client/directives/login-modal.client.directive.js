(function () {
    'use strict';

    angular.module('users')
        .directive('loginModal', LoginModalDirective);

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
            controller: LoginModalController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    LoginModalController.$inject = ['$scope', '$uibModal', '$log', '$attrs'];
    function LoginModalController($scope, $uibModal, $log, $attrs) {
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
            var modalInstance = $uibModal.open({
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

})();
