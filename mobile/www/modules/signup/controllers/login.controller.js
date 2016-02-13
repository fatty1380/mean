(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$state', 'lockboxDocuments', '$window', '$cordovaGoogleAnalytics',
        'registerService', 'LoadingService', 'tokenService', 'userService', 'securityService'];

    function LoginCtrl($state, lockboxDocuments, $window, $cordovaGoogleAnalytics,
        registerService, LoadingService, tokenService, userService, securityService) {
        var vm = this;
        vm.lastElementFocused = false;

        vm.error = '';
        vm.user = {
            email: '',
            password: ''
        };
        
        vm.focus = {
            email: true,
            pass: false
        };

        vm.signIn = signIn;
        vm.submitForm = submitForm;

        vm.echange = function () {
            vm.error = '';
            //logger.warn(' vm.user --->>>', vm.user.email);
        };
        /**
         * @description Submit form if last field in focus
        */
        function submitForm(event) {
            debugger;
            vm.error = '';
            
            if (vm.lastElementFocused) {
                vm.mainLoginForm.$submitted = true;
                return signIn();
            }
            
            vm.focus['pass'] = true;
            $cordovaGoogleAnalytics.trackEvent('login', 'submit', 'err:notLast');
        }

        /**
         * @description
         * Sign In
         */
        function signIn() {

            if (vm.mainLoginForm.$invalid) {
                $cordovaGoogleAnalytics.trackEvent('login', 'submit', 'err:formInvalid');
                return;
            }

            var then = Date.now();

            LoadingService.showLoader('Signing In');
            tokenService.set('access_token', '');

            registerService.signIn(vm.user)
                .then(function (response) {
                    
                    var data = response && response.message && response.message.data;
                    if (response.success && !!data) {
                        tokenService.set('access_token', data.access_token);
                        tokenService.set('refresh_token', data.refresh_token);
                        tokenService.set('token_type', data.token_type);

                        userService.getUserData()
                            .then(
                                function success(profileData) {
                                    securityService.initialize();
                                    lockboxDocuments.removeOtherUserDocuments(profileData.id);

                                    $cordovaGoogleAnalytics.trackEvent('login', 'submit', 'success');
                                    $cordovaGoogleAnalytics.trackTiming('login', Date.now() - then, 'submit', 'success');

                                    LoadingService.hide();
                                    $state.go('account.profile');
                                },
                                function fail(err) {
                                    logger.error('Unable to retrieve user information', err);
                                    LoadingService.showAlert('Sorry, unable to login at this time');
                                })
                            .catch(
                                function fail(err) {
                                    logger.error('Unknown error occurred after loading user data', err);
                                    
                                    if(_.isEmpty(userService.profileData)) {
                                      LoadingService.showAlert('Sorry, unable to login at this time');  
                                    } else {
                                        LoadingService.hide();
                                        $state.go('account.profile');
                                    }
                                });

                        vm.error = '';
                    } else {
                        var status = response.message && response.message.status;
                        if (_.includes([401, 403], status)) {
                            vm.error = 'Please double-check email and password';
                        } else {
                            vm.error = 'Unable to authenticate. Please try again later';
                        }
                        LoadingService.hide();

                        $cordovaGoogleAnalytics.trackEvent('login', 'submit', 'err', status);

                        selectInputValue('password');
                    }
                });
        }

        function selectInputValue(id) {
            var password = document.getElementById(id);
            password.setSelectionRange(0, password.value.length);
        }

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



