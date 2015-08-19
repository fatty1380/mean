(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['$scope', '$state', 'userService', 'registerService', 'tokenService'];

    function ProfileEditCtrl($scope, $state, userService, registerService, tokenService) {
        var vm = this;
        
        vm.profileData = userService.profileData;

        vm.cancel = function () {
            debugger;
            vm.closeModal(null);
        };

        vm.save = function () {
            console.log('Saving user data: ', vm.profileData);

            return userService.updateUserData(vm.profileData)
                .then(function (success) {
                    debugger;
                    vm.closeModal(success);
                })
                .catch(function (error) {
                    console.error('Unable to save user data: ', error);
                })
        }

        vm.logout = function () {
            registerService
                .signOut()
                .then(function (data) {
                    tokenService.set('access_token', '');
                    tokenService.set('refresh_token', '');
                    tokenService.set('token_type', '');

                    vm.cancel();

                    $state.go('signup/login');
                })
        }
    }

})();
