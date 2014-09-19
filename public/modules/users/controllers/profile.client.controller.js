'use strict';

function ProfileController($scope, $stateParams, Users, Drivers, Authentication) {
    $scope.activeModule = 'users';
    $scope.profileOnly = true;
    $scope.editMode = false;

    // Find existing User Profile
    $scope.init = function() {
        console.log('[ProfileController] init()');

        Users
            .get({
                userId: $stateParams.userId
            })
            .$promise
            .then(function(user) {
                console.log('[ProfileController] init() user = %o', user);
                $scope.user = user;

                Drivers.get({
                    userId: user._id
                }).$promise.then(function(driver) {
                    if (driver) {
                        console.log('[ProfileController] init() driver = %o', driver);
                        $scope.user.driver = driver;
                    }
                });
            });
    };
}

ProfileController.$inject = ['$scope', '$stateParams', 'Profile', 'DriverUser', 'Authentication'];

angular
    .module('users')
    .controller('ProfileController', ProfileController);


//var Regions = $resource('mocks/regions.json');//

//$scope.regions = Regions.query();
//$scope.regions.$promise.then(function(result) {
//    $scope.regions = result;
//});
