'use strict';

function ProfileController($scope, $stateParams, Users, Drivers, Authentication) {
    $scope.activeModule = 'users';
    $scope.profileOnly = true;
    $scope.editMode = false;

    // Find existing Job
    $scope.init = function() {
        debugger;
        $scope.user =
            Users.get({
                userId: $stateParams.userId
            });
        //.then($scope.getDriver);
    };

    $scope.getDriver = function() {
        $scope.driver = Drivers.get({
            userId: $scope.user._id
        });
    };
}

ProfileController.$inject = ['$scope', '$stateParams', 'Users', 'Drivers', 'Authentication'];

angular
    .module('users')
    .controller('ProfileController', ProfileController);
