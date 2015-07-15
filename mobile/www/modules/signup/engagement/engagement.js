angular
    .module('signup.engagement', [])
    .controller('engagementCtrl', function ($scope, $location) {
        /*console.log("signupEngagementCtrl");

         */

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

        var model = {
            handle: '',
            date: ''
        };

        $scope.continue = function() {
            console.log('continue license');
            $location.path("signup/license");
        }

        $scope.avatarShot = function() {
            console.log('avatarShot');
        }
    });
