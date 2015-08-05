(function () {
    'use strict';

    function loginCtrl($scope, $state, $location, registerService, $ionicPopup, $ionicLoading, tokenService) {
        var vm = this;

        vm.error = "";

        vm.user = {
            email: 'rykov.serge@gmail.com',
            password: 'testtest'
        };

        vm.initForm = function (scope) {
            vm.form = scope;
        }

        /**
         * @description
         * Sign In
         */
        vm.signIn = function () {

            console.log("signIn()");

            $ionicLoading.show({
                template: 'please wait'
            });

            tokenService.set('access_token', "");

            registerService.signIn(vm.user)
                .then(function (response) {
                    $ionicLoading.hide();

                    if (response.success) {
                        tokenService.set('access_token', response.message.data.access_token);
                        tokenService.set('refresh_token', response.message.data.refresh_token);
                        tokenService.set('token_type', response.message.data.token_type);
                        //$location.path("account/profile");
                        $state.go('account.profile')
                        vm.error = "";
                    } else {
                        vm.error = response.message.data.error_description || "error";
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

    loginCtrl.$inject = ['$scope', '$state', '$location', 'registerService', '$ionicPopup', '$ionicLoading', 'tokenService'];

    angular
        .module('signup')
        .controller('loginCtrl', loginCtrl);
})();



