'use strict';

function ProfileController($scope, $stateParams, $location, Profile, Authentication) {

    $scope.editMode = $scope.editMode || false;

    $scope.showEditLink = false;
    $scope.header = 'Your Profile';

    // Find existing User Profile
    this.init = function() {
        if (!$stateParams.userId) {
            $scope.profile = Authentication.user;
            $scope.header = 'Your ' + $scope.profile.type + ' profile';
            $scope.showEditLink = true;
        } else {
                var that = this;
                Profile.get({
                    userId: $stateParams.userId
                })
                .$promise
                .then(function(profile) {
                    $scope.profile = profile;

                    $scope.header = profile.displayName;
                    $scope.showEditLink = profile._id === Authentication.user._id;
                }, function(err) {
                    debugger;
                });
        }
    };

    this.initList = function() {
        debugger;
        if (Authentication.user.roles.indexOf('admin') !== -1) {
            this.users = Profile.query();
        } else {
            $location.path('/settings/profile');
        }
    };

    this.edit = function() {
        console.log('[ProfileController] edit()');
        $scope.editMode = true;
    };

    this.cancel = function() {
        console.log('[ProfileController] cancel()');
        $scope.editMode = false;
    };
}

ProfileController.$inject = ['$scope', '$stateParams', '$location', 'Profile', 'Authentication'];

angular
    .module('users')
    .controller('ProfileController', ProfileController);
