'use strict';

function ProfileController($scope, $stateParams, Users, Authentication) {
    $scope.activeModule = 'users';
    $scope.profileOnly = true;
    $scope.editMode = false;

    //    $scope.Profile = {
    //        'Companies': Companies,
    //        'Drivers': DriverUser
    //    };

    // Find existing User Profile
    $scope.init = function() {
        $scope.user =
            Users.get({
                userId: $stateParams.userId
            });

        //        $scope.driver = $scope.Profile.Drivers.get({
        //            userId: $stateParams.userId
        //        });
        //
        //        $scope.companies = $scope.Profile.Companies.get({
        //            userId: $stateParams.userId
        //        });

    };

    //    $scope.getDriver = function() {
    //        $scope.driver = $scope.Profile.Drivers.get({
    //            userId: $scope.user._id
    //        });
    //    };
}

ProfileController.$inject = ['$scope', '$stateParams', 'Users', 'Authentication'];

angular
    .module('users')
    .controller('ProfileController', ProfileController);
