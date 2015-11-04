(function () {
    'use strict';

    angular
        .module('signup')
        .controller('RegisterCtrl', RegisterCtrl);

    RegisterCtrl.$inject = ['$state', '$window', '$ionicPopup', '$ionicLoading', 'tokenService', 'welcomeService', 'securityService', 'registerService'];

    function RegisterCtrl($state, $window, $ionicPopup, $ionicLoading, tokenService, welcomeService, securityService, registerService) {
        var vm = this;
        vm.lastElementFocused = false;

        var branchData = JSON.parse($window.localStorage.getItem('branchData') || 'null');

        vm.user = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            referralCode: $window.localStorage.getItem('referralCode'),
            branchData: branchData
        };

        vm.initForm = initForm;
        vm.continueToEngagement = continueToEngagement;
        vm.submitForm = submitForm;

        function initForm(scope) {
            vm.form = scope;
        }

        /**
         * @description Submit form if last field in focus
         */
        function submitForm() {
            if (vm.lastElementFocused) {
                continueToEngagement();
            }
        }

        function continueToEngagement() {
            $ionicLoading.show({
                template: 'please wait'
            });
            registerService.registerUser(vm.user)
                .then(function (response) {

                    if (response.success) {
                        tokenService.set('access_token', '');
                        registerService.signIn({ email: response.message.data.email, password: vm.user.password })
                            .then(function (signInResponse) {
                                if (signInResponse.success) {
                                    // TODO: Move tokenService actions into registerService
                                    tokenService.set('access_token', signInResponse.message.data.access_token);
                                    tokenService.set('refresh_token', signInResponse.message.data.refresh_token);
                                    tokenService.set('token_type', signInResponse.message.data.token_type);

                                    //set fields to show welcome screens for new user
                                    welcomeService.initialize();
                                    securityService.initialize();

                                    $window.localStorage.removeItem('referralCode');
                                    $window.localStorage.removeItem('branchData');

                                    $state.go('signup-engagement');
                                } else {
                                    showPopup(null, signInResponse.title, signInResponse.message.data.error_description);
                                }
                            })
                            .finally(function () {
                                $ionicLoading.hide();
                            });
                    } else {
                        $ionicLoading.hide();
                        
                        showPopup(response, 'Registration Failed');
                    }
                });
        }

        function showPopup(response, title, message) {
            

            if (!!response) {
                if (response.message.status === 0) {
                    message = 'Request timed-out. Please, check your network connection.'
                } else {
                    message = response.message.data && response.message.data.message || 'Unable to Register at this time. Please try again later';
                }
            }

            if (/unique field/i.test(message)) {
                message = 'Email is already registered. Would you like to <a ui-sref="login">Login?</a>';
            }

            title = 'Sorry';
            
            $ionicPopup.alert({
                title: title || "Sorry",
                template: message || "no message"
            });
        }
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
    }

})();
