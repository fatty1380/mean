(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['$rootScope', '$ionicPopup', '$timeout', '$state', '$filter',
        'LoadingService', 'truckService', 'userService', 'profileModalsService', 'trailerService', 'tokenService'];

    function ProfileEditCtrl($rootScope, $ionicPopup, $timeout, $state, $filter,
        LoadingService, truckService, userService, profileModalsService, trailerService, tokenService) {
        var vm = this;

        if (!userService.profileData) {
            return $state.go('home');
        }

        vm.profileData = userService.profileData;
        vm.profileData.props = vm.profileData.props || {};
        vm.profileData.profileImageURL = userService.getAvatar(vm.profileData);

        vm.owner = vm.profileData.props.owner;
        vm.started = getFormattedDate(vm.profileData.props.started);

        vm.save = save;
        vm.logout = logout;
        vm.showProfileEditTrailersModal = showProfileEditTrailersModal;
        vm.showProfileEditTrucksModal = showProfileEditTrucksModal;
        vm.editLicense = showProfileEditLicenseModal;
        vm.updateTrailers = updateTrailers;
        vm.updateTrucks = updateTrucks;

        function updateTrailers(trailers) {
            if (!trailers) return;
            vm.profileData.props.trailer = trailers;
        }

        function updateTrucks(truck) {
            if (!truck) return;
            vm.profileData.props.truck = truck;
        }

        function showProfileEditTrailersModal() {
            trailerService
                .getTrailers()
                .then(function (trailers) {
                    profileModalsService
                        .showProfileEditTrailersModal({ trailers: trailers })
                        .then(function (trailers) {
                            if (!_.isUndefined(trailers)) {
                                vm.updateTrailers(trailers);
                            }
                        });
                });
        }

        function showProfileEditTrucksModal() {
            truckService
                .getTrucks()
                .then(function (trucks) {
                    profileModalsService
                        .showProfileEditTrucksModal({ trucks: trucks })
                        .then(function (truck) {
                            if (!_.isUndefined(truck)) {
                                vm.updateTrucks(truck);
                            }
                        });
                });
        }

        function showProfileEditLicenseModal() {
            profileModalsService
                .showProfileEditLicenseModal({ license: vm.profileData.license })
                .then(function success(license) {
                    console.log('Updated License to ', license);
                    vm.profileData.license = license;
                });
        }

        function getFormattedDate(date) {
            return $filter('date')($filter('monthDate')(date), 'MMMM, yyyy');
        }

        function save(form, e) {
            e.preventDefault();
            console.warn(' form --->>>', form);

            if (form.$valid) {
                // Update the started date
                if (vm.owner !== null) vm.profileData.props.owner = vm.owner;

                if (/\d{4,4}-\d{2,2}/.test(vm.started)) {
                    vm.profileData.props.started = vm.started;
                }

                console.log('Saving user data: ', vm.profileData);
                return userService.updateUserData(vm.profileData)
                    .then(function (success) {
                        if (success.id) {
                            debugger;
                            vm.closeModal(success);
                        } else {
                            $ionicPopup.alert({ title: 'Error', template: 'Profile wasn\'t updated' });
                            //vm.closeModal(null);
                        }
                    });
            } else {

                if (form.$error.number) {
                    LoadingService.showFailure('Please enter value as a number');
                } else if (form.$error.required) {
                    LoadingService.showFailure('Please enter all required fields');
                } else {
                    LoadingService.showFailure('Sorry, an error occured');
                }

                $timeout(function () {
                    $('input.ng-invalid').focus()
                }, 2000);
            }
        }

        function logout() {
            userService
                .signOut()
                .then(function (data) {
                    tokenService.set('access_token', '');
                    tokenService.set('refresh_token', '');
                    tokenService.set('token_type', '');

                    vm.cancelModal('logout');

                    //clear controllers data
                    $rootScope.$broadcast("clear");

                    $state.go('login');
                })
        }
    }

})();
