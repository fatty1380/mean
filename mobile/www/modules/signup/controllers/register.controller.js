(function() {
    'use strict';

     var registerCtrl = function ($scope, $state, $location, registerService, $ionicPopup, $ionicLoading) {

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

             console.log('vm.continue ');

             $ionicLoading.show({
                 template: 'please wait'
             });
            registerService.registerUser(vm.user)
                .then(function (response) {
                    $ionicLoading.hide();
                    if(response.success) {
                        $location.path("signup/engagement");
                    }else{
                        vm.showPopup(JSON.stringify(response));
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
                 $location.path("signup/engagement");
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

    registerCtrl.$inject = ['$scope','$state','$location','registerService','$ionicPopup', '$ionicLoading' ];

    angular
        .module('signup.register', [])
        .controller('registerCtrl', registerCtrl);

})();
