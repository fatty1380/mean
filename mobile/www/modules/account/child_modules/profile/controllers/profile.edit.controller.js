(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['$rootScope', '$ionicPopup', 'truckService', '$state', '$filter', 'userService', 'profileModalsService', 'trailerService', 'tokenService'];

    function ProfileEditCtrl($rootScope, $ionicPopup, truckService, $state, $filter, userService, profileModalsService, trailerService, tokenService) {
        var vm = this;

        if (!userService.profileData) {
            return $state.go('home');
        }
        
        vm.profileData = userService.profileData;
        vm.profileData.props = vm.profileData.props || {};
        vm.owner = vm.profileData.props.owner;
        vm.started = getFormattedDate(vm.profileData.props.started);

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
                            if (!_.isUndefined(trailers)) {
                                vm.updateTrailers(trailers);
                            }
                        });
                });
        }

        function showProfileEditTrucksModal () {
            truckService
                .getTrucks()
                .then(function (trucks) {
                    profileModalsService
                        .showProfileEditTrucksModal({trucks: trucks})
                        .then(function (truck) {
                            if (!_.isUndefined(truck)) {
                                vm.updateTrucks(truck);
                            }
                        });
                });
        }

        function getFormattedDate(date) {
            return $filter('date')($filter('monthDate')(date), 'MMMM, yyyy');
        }

        function cancel () {
            vm.closeModal(null);
        }

        function save(form, e) {
            e.preventDefault();
            console.warn(' form --->>>', form);

            if(form.$valid){
                // Update the started date
                if(vm.owner !== null) vm.profileData.props.owner = vm.owner;
                vm.profileData.props.started = vm.started;

                console.log('Saving user data: ', vm.profileData);
                return userService.updateUserData(vm.profileData)
                    .then(function (success) {
                        if(success.id){
                            vm.closeModal(success);
                        }else{
                            $ionicPopup.alert({title: 'Error', template: 'Profile wasn\'t updated'});
                            vm.closeModal(null);
                        }
                    });
            }else{
                $ionicPopup.alert({title: 'Error', template: 'Please, enter all required fields.'});
            }
        }

        function logout () {
            userService
                .signOut()
                .then(function (data) {
                    tokenService.set('access_token', '');
                    tokenService.set('refresh_token', '');
                    tokenService.set('token_type', '');

                    vm.cancel();

                    //clear controllers data
                    $rootScope.$broadcast("clear");

                    $state.go('login');
                })
        }
    }

})();
