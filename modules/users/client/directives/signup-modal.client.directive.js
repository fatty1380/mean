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
                type: '@?',
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

        vm.type = vm.type || null;

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
                    type: function() { return vm.type; },
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

    function SignupController($state, $modalInstance, $log, Authentication, type, srefRedirect) {
        var vm = this;
        vm.auth = Authentication;
        vm.credentials = { type: type, terms: '' };
        vm.srefRedirect = srefRedirect;

        vm.extraText = vm.srefRedirect && vm.srefRedirect.text  || null;

        vm.handleRedirect = function(response) {
            if ($state.is('jobs.view') && response.isDriver) {
                $log.debug('New Driver currently at state `%s`, Redirecting to home', $state.$current.name);
                debugger; // TODO: Convert the new-user functionality from drivers.home state to user.view
                $state.go('users.view', {newUser: true}, {reload: true});
            } else if(vm.srefRedirect) {
                $state.go(vm.srefRedirect.state, vm.srefRedirect.params, {reload: true});
            } else if (!$state.includes('intro')) {
                $log.debug('currently at state `%s`, staying here and not redirecting home', $state.$current.name);
                $state.go($state.current, {newUser: true}, {reload: true});
            } else {
                $state.go('home');
            }
            $modalInstance.close();
        };


        vm.signup = function(event) {

            vm.loading = true;

            vm.signupFormMethods.validate()
                .then(function(success) {
                    $log.debug('[SignupApplyModal] validated: %s', success);
                    return vm.signupFormMethods.submit();
                })
                .then(vm.handleRedirect)
                .catch(function (error) {
                    vm.error = error;
                })
                .finally(function () {
                    vm.loading = false;
                });
        };
    }

    SignupController.$inject = ['$state', '$modalInstance', '$log', 'Authentication', 'type', 'srefRedirect'];
    SignupModalController.$inject = ['$modal', '$log', '$attrs'];

    angular.module('users')
        .directive('signupModal', SignupModalDirective)
        .controller('SignupModalController', SignupModalController)
        .controller('SignupController', SignupController);

})();
