(function() {
    'use strict';

    angular
        .module('signup.signin', [])

        .controller('signinCtrl', function ($scope, $location, registerService, $ionicPopup, $ionicLoading ) {

            var vm = this;

            vm.user = {
                email: 'test@test.test',
                password: 'testtest'
            };

            vm.initForm= function(scope){
                vm.form = scope;
            }

            vm.signIn = function(){
                 $ionicLoading.show({
                    template: 'please wait'
                 });
                 registerService.signIn(vm.user)
                     .then(function (response) {
                     $ionicLoading.hide();
                     if(response.success) {
                        // $location.path("account/profile");
                         vm.showPopup(JSON.stringify(response.message.data || "none"));
                     }else{
                        //vm.showPopup(response);
                         vm.showPopup(JSON.stringify(response));
                     }
                 });
            }

            vm.me = function(){
                $ionicLoading.show({
                    template: 'please wait'
                });
                registerService.me()
                    .then(function (response) {
                        $ionicLoading.hide();
                        if(response.success) {
                            // $location.path("account/profile");
                            vm.showPopup(JSON.stringify(response.message.data));
                        }else{
                            //vm.showPopup(response);
                            vm.showPopup(JSON.stringify(response));
                        }
                    });
            }

            vm.signOut = function(){
                $ionicLoading.show({
                    template: 'please wait'
                });
                registerService.signOut(vm.user)
                    .then(function (response) {
                        $ionicLoading.hide();
                        if(response.success) {
                            // $location.path("account/profile");
                            console.log(response);
                            //vm.showPopup(JSON.stringify(response.message.data));
                        }else{
                            //vm.showPopup(response);
                            vm.showPopup(JSON.stringify(response));
                        }
                    });
            }

            vm.getProfiles = function(){
                $ionicLoading.show({
                    template: 'please wait'
                });
                registerService.getProfiles(vm.user)
                    .then(function (response) {
                        $ionicLoading.hide();
                        console.log(response);

                        if(response.success) {
                          //  $location.path("account/profile");
                            vm.showPopup(JSON.stringify(response.message.data));
                        }else{
                        //    vm.showPopup(response);
                            vm.showPopup(JSON.stringify(response));
                        }
                    });
            }

            vm.getProfilesID = function(){
                $ionicLoading.show({
                    template: 'please wait'
                });
                registerService.getProfilesID(vm.user)
                    .then(function (response) {
                        $ionicLoading.hide();
                        console.log(response);
                       // console.log(JSON.stringify(response.message.data));
                        //vm.showPopup(JSON.stringify(response.message.data));
                        if(response.success) {
                            //  $location.path("account/profile");
                            vm.showPopup(JSON.stringify(response.message.data));
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


            vm.continueRegister = function(){
                //console.log('continue register');
                $location.path("signup/register");
            }

            vm.continueProfile = function(){
                console.log('continue profile');
               // $location.path("account/profile");
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
    })

})();


