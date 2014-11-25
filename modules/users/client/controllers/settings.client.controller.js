(function() {
    'use strict';

    function SettingsController($scope, $http, $stateParams, $location, $log, Users, Authentication) {
        this.user = Authentication.user;
        debugger;

        // If user is not signed in then redirect back home
        if (!this.user) {
            $location.path('/');
        } else {
            debugger;
        }

        // Init or Inherit the 'editMode' setting.
        // TODO: Move to isolate Scope
        this.editMode = $scope.editMode || {
            enabled: false,
            visible: true
        };

        this.header = 'Your Profile';

        this.init = function() {

            if (!!$stateParams.userId) {
                $log.debug('[SettingsController] init(%o) - Profile', this.user);

                this.user = Users.get({
                    userId: $stateParams.userId
                });

                var promise = this.user.$promise;

                promise
                    .then(this.setProfile, function(err) {
                        $log.debug('Error retrieving profile', err);
                    });
            } else {
                $log.debug('[SettingsController] init(%o) - User Settings', this.user);
                this.user = Authentication.user;
                this.showEditLink = this.showEditLink = true;
            }
        };


        this.setProfile = function(profile) {
            debugger;
            // TODO: Fix this logic - it's fully borked!
            $scope.user = profile;
            $scope.header = profile.displayName;
            $scope.showEditLink = profile._id === Authentication.user._id;
        };

        // Update a user profile
        this.updateUserProfile = function(isValid) {
            if (isValid) {
                this.success = this.error = null;
                var user = new Users(this.user);

                user.$update(function(response) {
                    this.user = Authentication.user = response;
                    this.cancel();
                }, function(response) {
                    this.error = response.data.message;
                });
            } else {
                this.submitted = true;
            }
        };

    }

    SettingsController.$inject = ['$scope', '$http', '$stateParams', '$location', '$log', 'Users', 'Authentication'];

    angular
        .module('users')
        .controller('SettingsController', SettingsController);
})();
