(function() {
    'use strict';

     var registerCtrl = function ($scope, $state, $location, registerService, $ionicPopup, $ionicLoading, tokenService) {

         var vm = this;

         vm.user = {
             firstName: "test",
             lastName: "test",
             email:"test@test.test",
             password:"testtest",
             confirmPassword:"testtest"
         };

         vm.initForm= function(scope){
             vm.form = scope;
         }


         vm.continue = function(){

             console.log('vm.continue !!!!!!');

             $ionicLoading.show({
                 template: 'please wait'
             });
            registerService.registerUser(vm.user)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("register");
                    console.log(vm.user);
                    console.log(response);

                    $ionicLoading.hide();
                    if(response.success) {

                       console.log('registerUser: ',response);

                       /* tokenService.set('access_token', '');

                          registerService.signIn({ email:response.message.data.email, password: vm.user.password })
                            .then(function (response) {
                                $ionicLoading.hide();
                                console.log('signIn: ',response);
                                if(response.success) {
                                    tokenService.set('access_token', response.message.data.access_token);
                                    tokenService.set('refresh_token', response.message.data.refresh_token);
                                    tokenService.set('token_type', response.message.data.token_type);
                                   // vm.showPopup(JSON.stringify(response.message.data || "none"));
                                    $location.path("signup/engagement");
                                }else{
                                    //vm.showPopup(response);
                                    vm.showPopup(JSON.stringify(response));
                                }
                            });
*/
                       // $location.path("signup/signin");
                        $location.path("signup/engagement");
                    }else{
                        $location.path("signup/engagement");
                       // vm.showPopup(JSON.stringify(response));
                    }
                });
        }

         vm.showPopup = function (response) {
             console.log(response);
             var alertPopup = $ionicPopup.alert({
                 title: response.title || "title",
                 template: response || "no message"
             });
             alertPopup.then(function(res) {
                // $location.path("signup/engagement");
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

    registerCtrl.$inject = ['$scope','$state','$location','registerService','$ionicPopup', '$ionicLoading', 'tokenService'];

    angular
        .module('signup.register', [])
        .controller('registerCtrl', registerCtrl);

})();
