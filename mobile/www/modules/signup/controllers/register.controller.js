(function () {
    'use strict';

    angular
        .module('signup')
        .controller('RegisterCtrl', RegisterCtrl);

    RegisterCtrl.$inject = ['$state', 'registerService', '$ionicPopup', '$ionicLoading', 'tokenService', 'welcomeService'];

    function RegisterCtrl($state, registerService, $ionicPopup, $ionicLoading, tokenService, welcomeService) {
        var vm = this;
        vm.lastElementFocused = false;

        vm.user = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: ""
        };

        vm.initForm = initForm;
        vm.continueToEngagement = continueToEngagement;
        vm.submitForm = submitForm;

        function initForm(scope) {
            vm.form = scope;
        };

        /**
         * @description Submit form if last field in focus
         */
        function submitForm() {
            if(vm.lastElementFocused) {
                continueToEngagement();
            }
        }

        function continueToEngagement() {
            $ionicLoading.show({
                template: 'please wait'
            });
            registerService.registerUser(vm.user)
            .then(function (response) {

                $ionicLoading.hide();
                if (response.success) {
                    tokenService.set('access_token', '');
                    registerService.signIn({ email: response.message.data.email, password: vm.user.password })
                        .then(function (signInresponse) {
                            $ionicLoading.hide();
                            if (signInresponse.success) {
                                // TODO: Move tokenService actions into registerService
                                tokenService.set('access_token', signInresponse.message.data.access_token);
                                tokenService.set('refresh_token', signInresponse.message.data.refresh_token);
                                tokenService.set('token_type', signInresponse.message.data.token_type);

                                //set fields to show welcome screens for new user
                                welcomeService.welcomeUser = true;
                                welcomeService.welcomeActivity = true;

                                $state.go('signup-engagement');
                            } else {
                                showPopup(signInresponse.title, signInresponse.message.data.error_description);
                            }
                        });
                } else {
                    $ionicLoading.hide();
                    var message = response.message.data && response.message.data.message || 'Unable to Register at this time. Please try again later';
                    showPopup(response.title || 'Sorry', message);
                }
            });
        };

        function showPopup(title, text) {
             $ionicPopup.alert({
                 title: title || "title",
                 template: text || "no message"
             });
        };
        //
        //$scope.$on('$ionicView.afterEnter', function () {
        //    // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        window.cordova.plugins.Keyboard.disableScroll(true);
        //    }
        //});
        //$scope.$on('$ionicView.beforeLeave', function () {
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        // return to keyboard default scroll state
        //        window.cordova.plugins.Keyboard.disableScroll(false);
        //    }
        //});
    };

})();
