(function() {

    'use strict';

    function EditProfileController($http, $location, $log, Users, Authentication) {

        //this.profile = null;

        if(!this.profile) {
            $log.warn('[EditProfileController] No profile passed to osEditProfile Directive');
        }

        this.profile = this.profile || Authentication.user;

        $log.info('[EditProfileController] Profile %o', this.profile)

        // Update a user profile
        this.updateUserProfile = function(isValid) {
            if (isValid) {
                this.success = this.error = null;
                var user = new Users(this.user);

                user.$update(function(response) {
                    this.success = true;
                    Authentication.user = response;
                }, function(response) {
                    this.error = response.data.message;
                });
            } else {
                this.submitted = true;
            }
        };

        this.cancel = function() {
            alert('Cancel not yet implemented');
        };
    }

    EditProfileController.$inject = ['$http', '$location', '$log', 'Users', 'Authentication'];

    angular.module('users')
        .controller('EditProfileController', EditProfileController);


})();
