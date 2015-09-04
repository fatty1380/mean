(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicLoading', 'tokenService', 'userService'];

    function LoginCtrl($scope, $state, registerService, $ionicLoading, tokenService, userService) {
        var vm = this;
        vm.lastElementFocused = false;

        vm.error = '';
        vm.user = {
            email: 'rykov.serge@gmail.com',
            password: 'testtest'
        };

        vm.initForm = initForm;
        vm.signIn = signIn;
        vm.submitForm = submitForm;

        function initForm(scope) {
            vm.form = scope;
        }

        /**
         * @description Submit form if last field in focus
        */
        function submitForm() {
            if(vm.lastElementFocused) {
                signIn();
            }
        }

        /**
         * @description
         * Sign In
         */
        function signIn() {
            $ionicLoading.show({
                template: 'please wait'
            });
            tokenService.set('access_token', '');

            registerService.signIn(vm.user)
            .then(function (response) {
                $ionicLoading.hide();
                var data = response.message.data;
                if (response.success) {
                    tokenService.set('access_token', data.access_token);
                    tokenService.set('refresh_token',data.refresh_token);
                    tokenService.set('token_type', data.token_type);

                    registerService
                        .me()
                        .then(function (profileData) {
                            userService.profileData = profileData.message.data;
                            $state.go('account.profile');
                        });

                    vm.error = '';
                } else {
                    vm.error = data.error_description || "error";
                }
            });
        }

        $scope.$on('$ionicView.afterEnter', function () {
            // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
            if (window.cordova && window.cordova.plugins.Keyboard) {
                window.cordova.plugins.Keyboard.disableScroll(true);
            }
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // return to keyboard default scroll state
                window.cordova.plugins.Keyboard.disableScroll(false);
            }
        });
    }
})();



