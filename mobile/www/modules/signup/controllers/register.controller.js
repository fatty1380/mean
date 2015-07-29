(function () {
    'use strict';

    var registerCtrl = function ($scope, $state, registerService, $ionicPopup, $ionicLoading, tokenService) {

        var vm = this;

        vm.user = {
            firstName: "test",
            lastName: "test",
            email: "test@test.test",
            password: "testtest",
            confirmPassword: "testtest"
        };

        vm.initForm = function (scope) {
            vm.form = scope;
        };

         vm.continueToEngagement = function(){

             console.log(' ');
             console.log(' ');
             console.log('continueToEngagement()');

            $ionicLoading.show({
                template: 'please wait'
            });
            registerService.registerUser(vm.user)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("registerService.registerUser()");
                    console.log(vm.user);
                    console.log(response);

                    $ionicLoading.hide();
                    if (response.success) {
                        tokenService.set('access_token', '');
                        registerService.signIn({ email: response.message.data.email, password: vm.user.password })
                            .then(function (signInresponse) {
                                console.log('signInresponse : ',signInresponse);
                                $ionicLoading.hide();
                                if(signInresponse.success) {
                                    tokenService.set('access_token', signInresponse.message.data.access_token);
                                    tokenService.set('refresh_token', signInresponse.message.data.refresh_token);
                                    tokenService.set('token_type', signInresponse.message.data.token_type);
                                    $state.go('signup/engagement');
                                } else {
                                    vm.showPopup(signInresponse.title, signInresponse.message.data.error_description);
                                }
                            });
                    } else {
                        $ionicLoading.hide();
                        
                        var message = response.message.data && response.message.data.message || 'Unable to Register at this time. Please try again later';
                        
                        vm.showPopup(response.title || 'Sorry', message);
                    }
                });
        }

         vm.showPopup = function (title, text) {
             //console.log(title, text);
             $ionicPopup.alert({
                 title: title || "title",
                 template: text || "no message"
             });
         };

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
    };

    registerCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', '$ionicLoading', 'tokenService'];

    angular
        .module('signup')
        .controller('registerCtrl', registerCtrl);

})();
