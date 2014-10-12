'use strict';

function ProfileController($scope, $stateParams, Users, Authentication) {
    $scope.activeModule = 'users';
    $scope.editMode = false;

    // Find existing User Profile
    $scope.init = function() {
        if (!$stateParams.userId) {
            $scope.profileOnly = false;
            $scope.user = Authentication.user;
        } else {
            $scope.profileOnly = true;
            $scope.user =
                Users.get({
                    userId: $stateParams.userId
                });
        }
    };

    $scope.edit = function() {
        $scope.editMode = true;
    };
    $scope.cancel = function() {
        $scope.editMode = false;
    };
}

ProfileController.$inject = ['$scope', '$stateParams', 'Users', 'Authentication'];

angular
    .module('users')
    .controller('ProfileController', ProfileController);
