(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicLoading', 'tokenService', 'userService', 'focusService'];

    function LoginCtrl($scope, $state, registerService, $ionicLoading, tokenService, userService, focusService) {
        var vm = this;
        vm.lastElementFocused = false;

        vm.error = '';
        vm.user = {
            email: 'rykov@mobidev.biz',
            password: 'admin@123'
        };

        vm.initForm = initForm;
        vm.signIn = signIn;
        vm.submitForm = submitForm;

        function initForm(scope) {
            vm.form = scope;
        }

        vm.echange = function () {
            console.warn(' vm.user --->>>', vm.user.email);
        };
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
                if (response.success && !!data) {
                    tokenService.set('access_token', data.access_token);
                    tokenService.set('refresh_token',data.refresh_token);
                    tokenService.set('token_type', data.token_type);

                    registerService
                        .me()
                        .then(function (profileData) {
                            userService.profileData = profileData.message.data;
                            $state.go('account.profile.user');
                        });

                    vm.error = '';
                } else {
                    vm.error = !!data && data.error_description || "error";
                    selectInputValue('password');
                }
            });
        }

        function selectInputValue (id) {
            var password = document.getElementById(id);
            password.setSelectionRange(0, password.value.length);
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



