(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['truckService', '$state', 'userService', 'profileModalsService', 'trailerService', 'tokenService'];

    function ProfileEditCtrl(truckService, $state, userService, profileModalsService, trailerService, tokenService) {
        var vm = this;
        
        vm.profileData = userService.profileData;

        vm.cancel = cancel;
        vm.save = save;
        vm.logout = logout;
        vm.showProfileEditTrailersModal = showProfileEditTrailersModal;
        vm.showProfileEditTrucksModal = showProfileEditTrucksModal;
        vm.updateTrailers = updateTrailers;
        vm.updateTrucks = updateTrucks;

        function updateTrailers (trailers) {
            if(!trailers) return;
            vm.profileData.props.trailer = trailers;
        }

        function updateTrucks (truck) {
            if(!truck) return;
            vm.profileData.props.truck = truck;
        }

        function showProfileEditTrailersModal () {
            trailerService
                .getTrailers()
                .then(function (trailers) {
                    profileModalsService
                        .showProfileEditTrailersModal({trailers: trailers})
                        .then(function (trailers) {
                            vm.updateTrailers(trailers);
                        });
                });
        }

        function showProfileEditTrucksModal () {
            truckService
                .getTrucks()
                .then(function (trucks) {
                    profileModalsService
                        .showProfileEditTrucksModal({trucks: trucks})
                        .then(function (trucks) {
                            vm.updateTrucks(trucks);
                        });
                });
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
