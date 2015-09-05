(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['$scope', '$state', 'userService', 'profileModalsService', 'trailerService', 'tokenService'];

    function ProfileEditCtrl($scope, $state, userService, profileModalsService, trailerService, tokenService) {
        var vm = this;
        
        vm.profileData = userService.profileData;

        vm.cancel = cancel;
        vm.save = save;
        vm.logout = logout;
        vm.showProfileEditTrailersModal = showProfileEditTrailersModal;
        vm.showProfileEditTrucksModal = showProfileEditTrucksModal;

        function showProfileEditTrailersModal () {
            trailerService
                .getTrailers()
                .then(function (trailers) {
                    console.warn(' trailers --->>>', trailers);
                    profileModalsService
                        .showProfileEditTrailersModal({trailers: trailers})
                        .then(function (modalserviceResponse) {
                            console.warn(' vm.profileData --->>>', vm.profileData);
                            console.warn(' modalserviceResponse --->>>', modalserviceResponse);
                        })
                });
        }

        function showProfileEditTrucksModal () {
            profileModalsService
                .showProfileEditTrucksModal()
                .then(function () {

                })
        }

        function cancel () {
            vm.closeModal(null);
        }

        function save () {
            console.log('Saving user data: ', vm.profileData);

            return userService.updateUserData(vm.profileData)
                .then(function (success) {
                    vm.closeModal(success);
                })
                .catch(function (error) {
                    console.error('Unable to save user data: ', error);
                })
        }

        function logout () {
            userService
                .signOut()
                .then(function (data) {
                    tokenService.set('access_token', '');
                    tokenService.set('refresh_token', '');
                    tokenService.set('token_type', '');

                    vm.cancel();

                    $state.go('login');
                })
        }
    }

})();
