/* global logger */
/* global _ */
(function () {
    'use strict';

    angular
        .module('signup')
        .controller('RegisterCtrl', RegisterCtrl);

    RegisterCtrl.$inject = ['$state', '$window', '$ionicPopup', '$cordovaGoogleAnalytics',
        'LoadingService', 'tokenService', 'welcomeService', 'securityService', 'registerService', 'userService', 'lockboxDocuments'];

    angular.module('signup')
        .directive('focus', function () {
            return {
                restrict: 'A',
                link: function ($scope, elem, attrs) {

                    elem.bind('keydown', function (event) {
                        if ((event.keyCode || event.which) === 13) {
                            event.preventDefault();
                            try {
                                var e = elem.parent().next().children('input');

                                if (_.isEmpty(e)) {
                                    e = elem.parent().parent().next().children('input');
                                }
                                if (_.isEmpty(e)) {
                                    throw new Error('Unable to locate password in parent or parent\'s parent');
                                }

                                event.preventDefault();
                                e[0].focus();
                            } catch (error) {
                                logger.error('Focus change failed', error);
                            }
                        }
                    });
                }
            };
        });

    function RegisterCtrl ($state, $window, $ionicPopup, $cordovaGoogleAnalytics,
        LoadingService, tokenService, welcomeService, securityService, registerService,
        userService, lockboxDocuments) {
        var vm = this;
        vm.lastElementFocused = false;

        var branchData = angular.fromJson($window.localStorage.getItem('branchData') || 'null');

        vm.user = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            referralCode: $window.localStorage.getItem('referralCode'),
            branchData: branchData
        };

        vm.continueToEngagement = continueToEngagement;
        vm.submitForm = submitForm;
        vm.clearConfirm = clearConfirm;

        /**
         * @description Submit form if last field in focus
         */
        function submitForm (event) {
            if (vm.lastElementFocused) {
                return continueToEngagement();
            }

            $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'formErr:notLast');
        }

        function clearConfirm () {
            vm.user.confirmPassword = '';
        }

        function continueToEngagement () {

            if (vm.user.confirmPassword !== vm.user.password) {
                // vm.user.confirmPassword = '';
                // vm.user.password = '';
                // vm.error = 'Passwords do not match';

                // vm.mainForm.password.$setValidity('compareTo', false);
                // vm.mainForm.confirmPassword.$setValidity('compareTo', false);
                vm.focusPass = true;
                return;
            }

            if (!vm.mainForm.$valid) {
                vm.error = vm.error || 'Please correct errors above';
                return;
            }

            vm.error = null;

            var then = Date.now();

            LoadingService.showLoader('Saving');
            registerService.registerUser(vm.user)
                .then(function (response) {

                    if (response.success) {
                        tokenService.set('access_token', '');
                        registerService.signIn({ email: response.message.data.username, password: vm.user.password })
                            .then(function (signInResponse) {
                                if (signInResponse.success) {
                                    // TODO: Move tokenService actions into registerService
                                    tokenService.set('access_token', signInResponse.message.data.access_token);
                                    tokenService.set('refresh_token', signInResponse.message.data.refresh_token);
                                    tokenService.set('token_type', signInResponse.message.data.token_type);

                                    // set fields to show welcome screens for new user
                                    welcomeService.initialize();
                                    securityService.initialize();

                                    $window.localStorage.removeItem('referralCode');
                                    $window.localStorage.removeItem('branchData');

                                    return userService.getUserData();
                                } else {
                                    showPopup(null, signInResponse.title, signInResponse.message.data.error_description);
                                }
                            })
                            .then(function success (profileData) {
                                if (!!profileData) {
                                    LoadingService.hide();
                                    $state.go('signup.license');

                                    lockboxDocuments.removeOtherUserDocuments(profileData.id);
                                    $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'signIn:success');
                                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'register', 'signIn:success');

                                    return;
                                }
                                $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'signIn:error');
                                $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'register', 'signIn:error');
                            });
                    } else {
                        LoadingService.hide();

                        $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'error');
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'register', 'error');

                        showPopup(response, 'Registration Failed');
                    }
                });
        }

        function showPopup (response, title, message) {
            if (!!response) {
                if (response.message.status === 0) {
                    message = 'Request timed-out. Please, check your network connection.';
                } else {
                    message = response.message.data && response.message.data.message || 'Unable to Register at this time. Please try again later';
                }
            }

            if (/unique field/i.test(message)) {
                message = 'Email is already registered. Would you like to <a ui-sref="login">LOGIN?</a>';
                LoadingService.hide();
                $ionicPopup.alert({
                    title: title || 'sorry',
                    template: message
                });
            } else {
                LoadingService.showFailure(message);
            }
        }
        //
        // $scope.$on('$ionicView.afterEnter', function () {
        //    // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        window.cordova.plugins.Keyboard.disableScroll(true);
        //    }
        // });
        // $scope.$on('$ionicView.beforeLeave', function () {
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        // return to keyboard default scroll state
        //        window.cordova.plugins.Keyboard.disableScroll(false);
        //    }
        // });
    }

})();
