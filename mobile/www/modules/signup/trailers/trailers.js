angular
    .module('signup.trailers', [])
    .controller('trailersCtrl', function ($scope, $location) {
        //console.log("signupTrailerCtrl");

        $scope.continue = function() {
            console.log(' end register ');
            //$location.path("signup/truck");
        }
    });
