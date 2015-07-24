(function() {
    'use strict';

    function loginCtrl ($scope, $location, registerService, $ionicPopup, $ionicLoading, tokenService) {
        var vm = this;

        vm.user = {
            email: 'markov.flash@gmail.com',
            password: 'sergey83mark'
        };

        vm.initForm= function(scope){
            vm.form = scope;
        }

        /**
         * @description
         * Sign In
         */

        vm.signIn = function(){
            $ionicLoading.show({
                template: 'please wait'
            });

            tokenService.set('access_token', "");

            registerService.signIn(vm.user)
                .then(function (response) {
                    $ionicLoading.hide();

                    if(response.success) {
                        tokenService.set('access_token', response.message.data.access_token);
                        tokenService.set('refresh_token', response.message.data.refresh_token);
                        tokenService.set('token_type', response.message.data.token_type);
                        $location.path("account/profile");
                    }else{
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }


        vm.showPopup = function (response) {
            var alertPopup = $ionicPopup.alert({
                title:  "title",
                template: response
            });
            alertPopup.then(function(res) {
            });
        }

        $scope.$on( '$ionicView.afterEnter', function () {
            // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                window.cordova.plugins.Keyboard.disableScroll( true );
            }
        });
        $scope.$on( '$ionicView.beforeLeave', function () {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                // return to keyboard default scroll state
                window.cordova.plugins.Keyboard.disableScroll( false );
            }
        });
    }

    loginCtrl.$inject = ['$scope', '$location', 'registerService', '$ionicPopup', '$ionicLoading' , 'tokenService'];

    angular
        .module('signup')
        .controller('loginCtrl', loginCtrl );
})();



