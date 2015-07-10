(function() {

    'use strict';

    function EditProfileController($http, $location, $log, Users, Authentication) {

        var vm = this;

        if(!vm.profile) {
            $log.warn('[EditProfileController] No profile passed to osEditProfile Directive');
        }

        vm.profile = vm.profile || Authentication.user;

        $log.info('[EditProfileController] Profile %o', vm.profile);

        // Update a user profile
        vm.updateUserProfile = function(isValid) {
            if (isValid) {
                vm.success = vm.error = null;

                var user = new Users(vm.profile);

                user.$update(function(response) {
                    vm.success = true;
                    vm.profile = Authentication.user = response;

                    vm.userForm.$setPristine();
                }, function(response) {
                    vm.error = response.data.message;
                });
            } else {
                vm.error = vm.userForm.$error();
            }
        };

        vm.cancel = function() {
            alert('Cancel not yet implemented');
        };
    }

    EditProfileController.$inject = ['$http', '$location', '$log', 'Users', 'Authentication'];

    angular.module('users')
        .controller('EditProfileController', EditProfileController);


})();
