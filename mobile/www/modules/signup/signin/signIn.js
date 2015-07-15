angular
    .module('signin', [])

    .controller('signinCtrl', function ($scope, $location) {

        var vm = this;

        vm.user = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

       /* $scope.continue = function(){
            console.log('continue engagement');
            $location.path("signup/engagement");
        }*/


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


