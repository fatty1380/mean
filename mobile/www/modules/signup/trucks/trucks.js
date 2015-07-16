angular
    .module('signup.trucks', [])
    .controller('trucksCtrl', function ($scope, $location) {
       // console.log("signupTruckCtrl");

        $scope.continue = function() {
            console.log('continue trailer');
            $location.path("signup/trailers");
        }
    });
