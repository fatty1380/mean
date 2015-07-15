angular
    .module('signup.license', [])
    .controller('licenseCtrl', function ($scope, $location) {
        //console.log("signupLicenseCtrl");

        /*$scope.color = {
            name: 'blue'
        };*/

        $scope.continue = function() {
            console.log('continue truck');
            $location.path("signup/truck");
        }
    });
