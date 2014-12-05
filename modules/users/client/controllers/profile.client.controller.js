(function() {
    'use strict';

    function ProfileController($scope, $state, $stateParams, $location, $log, Profiles, Authentication) {

        this.header = 'User Profile';

        // Find existing User Profile
        this.init = function() {
            if (!$stateParams.userId) { // Viewing your own profile
                this.user = Authentication.user;
                this.header = this.user.displayName + ' <small>(you)</small>';
                this.showEditLink = true;
            } else { // Viewing someone else's profile
                this.user = Profiles.get({
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
                this.users = Profiles.query();
            } else {
                $location.path('/');
            }
        };
    }

    ProfileController.$inject = ['$scope', '$state', '$stateParams', '$location', '$log', 'Profiles', 'Authentication'];

    angular
        .module('users')
        .controller('ProfileController', ProfileController);
})();
