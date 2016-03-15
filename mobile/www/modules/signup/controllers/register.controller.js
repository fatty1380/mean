/* global logger */
/* global _ */
(function () {
    'use strict';

    angular
        .module('signup')
        .controller('RegisterCtrl', RegisterCtrl);

    RegisterCtrl.$inject = ['$scope', '$state', '$window', '$ionicPopup', '$cordovaGoogleAnalytics',
        'LoadingService', 'tokenService', 'welcomeService', 'securityService', 'registerService', 'userService', 'lockboxDocuments'];



    function RegisterCtrl ($scope, $state, $window, $ionicPopup, $cordovaGoogleAnalytics,
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

        vm.save = next;
        vm.submitForm = submitForm;
        vm.clearConfirm = clearConfirm;

        /**
         * @description Submit form if last field in focus
         */
        function submitForm (event) {
            if (vm.lastElementFocused) {
                _.isFunction(vm.parentSubmit) ? vm.parentSubmit() : next();
            }

            $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'formErr:notLast');
        }

        function clearConfirm () {
            vm.user.confirmPassword = '';
        }

        function registerUser () {

            var then = Date.now();

            return registerService.registerUser(vm.user, true)
                .then(function (response) {
                    tokenService.set('access_token', '');
                    return registerService.signIn({ email: response.data.username, password: vm.user.password }, true);
                })
                .then(function (signInResponse) {
                    // TODO: Move tokenService actions into registerService
                    tokenService.set('access_token', signInResponse.data.access_token);
                    tokenService.set('refresh_token', signInResponse.data.refresh_token);
                    tokenService.set('token_type', signInResponse.data.token_type);

                    // set fields to show welcome screens for new user
                    welcomeService.initialize();
                    securityService.initialize();

                    $window.localStorage.removeItem('referralCode');
                    $window.localStorage.removeItem('branchData');

                    return userService.getUserData();
                })
                .then(function success (profileData) {
                    if (_.isEmpty(profileData)) {
                        $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'signIn:error');
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'register', 'signIn:error');

                        throw new Error('Signin Failed');
                    }

                    LoadingService.hide();
                    $state.go('signup.license');

                    lockboxDocuments.removeOtherUserDocuments(profileData.id);
                    $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'signIn:success');
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'register', 'signIn:success');

                    return profileData;
                });
        }

        function next () {
            debugger;

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
            return registerUser()
                .then(function (userProfile) {
                    debugger;
                    // $state.go(wizard.next || 'signup.handle', { profile: userProfile });
                    return userProfile;
                })
                .catch(function fail (err) {
                    LoadingService.hide();

                    $cordovaGoogleAnalytics.trackEvent('signup', 'register', 'error');
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'register', 'error');

                    // showPopup(null, err.statusText, err.data.error_description)
                    showPopup(err, 'Registration Failed');

                    throw err;
                });
        }

        function showPopup (response, title, message) {
            if (!!response) {
                if (response.status === 0) {
                    message = 'Request timed-out. Please, check your network connection.';
                }
                else {
                    message = response.data && response.data.message || 'Unable to Register at this time. Please try again later';
                }
            }

            if (/unique field/i.test(message)) {
                message = 'Email is already registered. Would you like to <a ui-sref="login">LOGIN?</a>';
                LoadingService.hide();
                $ionicPopup.alert({
                    title: title || 'sorry',
                    template: message
                });
            }
            else {
                LoadingService.showFailure(message);
            }
        }


        $scope.$on('$ionicView.afterEnter', function () {
            // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
            if ($window.cordova && $window.cordova.plugins.Keyboard) {
                $window.cordova.plugins.Keyboard.disableScroll(true);
            }
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            if ($window.cordova && $window.cordova.plugins.Keyboard) {
                // return to keyboard default scroll state
                $window.cordova.plugins.Keyboard.disableScroll(false);
            }
        });
    }

})();
