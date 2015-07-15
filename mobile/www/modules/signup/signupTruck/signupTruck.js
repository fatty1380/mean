angular
    .module('signupTruck', [])
    .controller('signupTruckCtrl', function ($scope, $location) {
       // console.log("signupTruckCtrl");

        $scope.continue = function() {
            console.log('continue trailer');
            $location.path("signup/trailer");
        }
    });
