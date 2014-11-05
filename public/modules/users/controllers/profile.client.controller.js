'use strict';

function ProfileController($scope, $stateParams, $location, Profile, Authentication) {
    $scope.activeModule = 'users';
    $scope.editMode = false;

    // Find existing User Profile
    $scope.init = function() {
        if (!$stateParams.userId) {
            $scope.profileOnly = false;
            $scope.user = Authentication.user;
        } else {
            $scope.profileOnly = true;
            $scope.profile =
                Profile.get({
                    userId: $stateParams.userId
                });
        }
    };

    $scope.initList = function() {
        if (Authentication.user.roles.indexOf('admin') !== -1) {
            $scope.users = Profile.query();
        } else {
            $location.path('/settings/profile');
        }
    };

    $scope.edit = function() {
        $scope.editMode = true;
    };
    $scope.cancel = function() {
        $scope.editMode = false;
    };
}

ProfileController.$inject = ['$scope', '$stateParams', '$location', 'Profile', 'Authentication'];

angular
    .module('users')
    .controller('ProfileController', ProfileController);
