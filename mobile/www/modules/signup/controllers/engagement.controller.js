(function() {
    'use strict';

    angular
        .module('signup.engagement', [])
        .controller('engagementCtrl', function ($scope, $location) {

            console.log("werewrwer");
            var vm = this;
            vm.handle = "t";
            vm.date = "tt";

            vm.cont = cont;

            function cont(){
                console.log('12312');
                console.log(vm);
            }

            $scope.$on( '$ionicView.afterEnter', function () {
                if ( window.cordova && window.cordova.plugins.Keyboard ) {
                    window.cordova.plugins.Keyboard.disableScroll( true );
                }
            });
            $scope.$on( '$ionicView.beforeLeave', function () {
                if ( window.cordova && window.cordova.plugins.Keyboard ) {
                    window.cordova.plugins.Keyboard.disableScroll( false );
                }
            });

            $scope.cont = function() {
                console.log('continue license');
                console.log(vm);
                console.log(this);
               // $location.path("signup/license");
            }

            $scope.avatarShot = function() {
                console.log('avatarShot');
            }
        });

})();
