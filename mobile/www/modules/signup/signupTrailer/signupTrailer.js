angular
    .module('signupTrailer', [])
    .controller('signupTrailerCtrl', function ($scope, $location) {
        //console.log("signupTrailerCtrl");

        $scope.continue = function() {
            console.log(' end register ');
            //$location.path("signup/truck");
        }
    });
