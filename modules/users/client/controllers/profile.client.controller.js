(function() {
    'use strict';

    function ProfileController($scope, $stateParams, $location, $log, Profile, Authentication) {

        console.log('WARNING: TBD IF PROFILE CONTROLLER IS DUPE FUNCTIONALITY WITH OTHER USERS CONTROLLERS');

        this.editMode = $scope.editMode || {
            enabled: false,
            visible: true
        };

        this.showEditLink = false;
        this.header = 'Your Profile';

        // Find existing User Profile
        this.init = function() {
            if (!$stateParams.userId) {
                this.user = Authentication.user;
                this.header = this.header = 'Your ' + this.user.type + ' profile';
                this.showEditLink = this.showEditLink = true;
            } else {
                this.user = Profile.get({
                    userId: $stateParams.userId
                });

                var promise = this.user.$promise;

                promise
                    .then(this.setProfile, function(err) {
                        $log.debug('Error retrieving profile', err);
                    });
            }
        };

        this.setProfile = function(profile) {
            // TODO: Fix this logic - it's fully borked!
            $scope.profile = profile;
            $scope.header = profile.displayName;
            $scope.showEditLink = profile._id === Authentication.user._id;
        };

        this.initList = function() {
            if (Authentication.user.roles.indexOf('admin') !== -1) {
                this.users = Profile.query();
            } else {
                $location.path('/settings/profile');
            }
        };

        this.edit = function() {
            $log.debug('[ProfileController] edit()');
            this.editMode.enabled = true;
        };

        this.cancel = function() {
            $log.debug('[ProfileController] cancel()');
            this.editMode.enabled = false;
        };
    }

    ProfileController.$inject = ['$scope', '$stateParams', '$location', '$log', 'User', 'Authentication'];

    angular
        .module('users')
        .controller('UserController', ProfileController);
})();
