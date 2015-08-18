(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['$scope', '$state', 'userService', 'registerService', 'tokenService'];

    function ProfileEditCtrl($scope, $state,  userService, registerService, tokenService) {
        var vm = this;

        vm.profileData = userService.profileData;

        vm.cancel = function () {
            $scope.closeModal(null);
        };

        vm.logout = function () {
            registerService
                .signOut()
                .then(function(data){
                    tokenService.set('access_token', '');
                    tokenService.set('refresh_token', '');
                    tokenService.set('token_type', '');

                    vm.cancel();

                    $state.go('signup/login');
            })
        }
    }

})();
