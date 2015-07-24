(function () {
    'use strict';

    function signinCtrl($scope, $state, registerService, $ionicPopup, $ionicLoading, tokenService) {
        var vm = this;

        vm.user = {
            email: 'markov.flash@gmail.com',
            password: 'sergey83mark'
        };

        vm.initForm = function (scope) {
            vm.form = scope;
        }

        /**
         * @description
         * Sign In
         */

        vm.signIn = function () {
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
                        $state.go('account.profile');
                    } else {
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }



        vm.registerAndSignin = function () {
            console.log(' ');
            console.log(' ');
            console.log('registerAndSignin()');

            /* $ionicLoading.show({
             template: 'please wait'
             });*/

            var signupUser = {
                email: vm.user.email,
                password: vm.user.password,
                firstName: "testAccountName",
                lastName: "testAccountLastName"
            };

            registerService.registerUser(signupUser)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("registerUser response: ", response);

                    $ionicLoading.hide();
                    if (response.success) {

                        tokenService.set('access_token', '');

                        // setTimeout( function(){

                        var signinUser = {
                            email: vm.user.email,
                            password: vm.user.password,
                            grant_type: 'password',
                            client_id: 'mobile_v0_1',
                            client_secret: 'shenanigans'
                        };

                        registerService.signIn(signinUser)
                            .then(function (response) {
                                $ionicLoading.hide();

                                if (response.success) {
                                    tokenService.set('access_token', response.message.data.access_token);
                                    tokenService.set('refresh_token', response.message.data.refresh_token);
                                    tokenService.set('token_type', response.message.data.token_type);
                                    $state.go('signup/engagement');
                                } else {
                                    //vm.showPopup(response);
                                    vm.showPopup(JSON.stringify(response));
                                }
                            });
                        /// vm.showPopup(JSON.stringify(response));
                    } else {
                        // $state.go('signup/engagement');
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }



        vm.me = function () {
            $ionicLoading.show({
                template: 'please wait'
            });

            // console.log('access_token: ', tokenService.get("access_token"));

            registerService.me()
                .then(function (response) {
                    $ionicLoading.hide();
                    if (response.success) {
                        // $state.go('account.profile');
                        vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        //vm.showPopup(response);
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.profileID = function () {
            $ionicLoading.show({
                template: 'please wait'
            });
            $ionicLoading.hide();

            console.log('profileID');

            registerService.getProfilesID('55a5317e4cec3d4a40d4bfa9')
                .then(function (response) {
                    $ionicLoading.hide();
                    if (response.success) {
                        // $state.go('account.profile');
                        vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        //vm.showPopup(response);
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.signOut = function () {
            $ionicLoading.show({
                template: 'please wait'
            });
            registerService.signOut(vm.user)
                .then(function (response) {
                    $ionicLoading.hide();
                    if (response.success) {
                        tokenService.set('access_token', '');
                        // $state.go('account.profile');
                        console.log(response);
                        //vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        //vm.showPopup(response);
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.getProfiles = function () {
            $ionicLoading.show({
                template: 'please wait'
            });
            registerService.getProfiles(vm.user)
                .then(function (response) {
                    $ionicLoading.hide();
                    console.log(response);

                    if (response.success) {
                        //  $state.go('account.profile');
                        vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        //    vm.showPopup(response);
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.getProfilesID = function () {
            $ionicLoading.show({
                template: 'please wait'
            });
            registerService.getProfilesID(vm.user)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("signin");
                    console.log(vm.user);
                    console.log(response);


                    $ionicLoading.hide();
                    console.log(response);
                    // console.log(JSON.stringify(response.message.data));
                    //vm.showPopup(JSON.stringify(response.message.data));
                    if (response.success) {
                        //  $state.go('account.profile');
                        vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.setProps = function () {
            $ionicLoading.show({
                template: 'please wait'
            });

            var data = {
                "handle": "Gearjammer",
                "props": { "started": '1976', "company": "Big Jim's Truck Lines" }
            }


            registerService.updateUserProps(data)
                .then(function (response) {
                    $ionicLoading.hide();
                    if (response.success) {
                        // $state.go('account.profile');
                        vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        //vm.showPopup(response);
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.setLicense = function () {
            $ionicLoading.show({
                template: 'please wait'
            });

            var data = {
                'license': {
                    'class': 'C',
                    'endorsements': ['H'],
                    'state': 'CA'
                }
            }

            registerService.updateUserProps(data)
                .then(function (response) {
                    $ionicLoading.hide();
                    if (response.success) {
                        // $state.go('account.profile');
                        vm.showPopup(JSON.stringify(response.message.data));
                    } else {
                        //vm.showPopup(response);
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.showPopup = function (response) {
            var alertPopup = $ionicPopup.alert({
                title: "title",
                template: response
            });
            alertPopup.then(function (res) {
            });
        }


        vm.continueRegister = function () {
            console.log('continue register');
            $state.go('signup/register');
        }

        vm.continueProfile = function () {
            console.log('continue profile');
            // $state.go('account.profile');
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

    signinCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', '$ionicLoading', 'tokenService'];

    angular
        .module('signup')
        .controller('signinCtrl', signinCtrl);
})();

