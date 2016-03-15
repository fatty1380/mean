(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

    ProfileEditCtrl.$inject = ['$filter', '$ionicHistory', '$ionicScrollDelegate', '$location', '$rootScope', '$state', '$timeout',
        'LoadingService', 'parameters', 'profileModalsService', 'tokenService', 'trailerService', 'truckService', 'userService'];

    function ProfileEditCtrl ($filter, $ionicHistory, $ionicScrollDelegate, $location, $rootScope, $state, $timeout,
        LoadingService, parameters, profileModalsService, tokenService, trailerService, truckService, userService) {
        var vm = this;

        if (!userService.profileData) {
            return $state.go('home');
        }

        vm.activate = activate;

        vm.save = save;
        vm.logout = logout;
        vm.showProfileEditTrailersModal = showProfileEditTrailersModal;
        vm.showProfileEditTrucksModal = showProfileEditTrucksModal;
        vm.editLicense = showProfileEditLicenseModal;
        vm.editAddress = showEditAddress;
        vm.updateTrailers = updateTrailers;
        vm.updateTrucks = updateTrucks;
        vm.toggleMileUnit = toggleMileUnit;

        activate();

        function activate (inputUser) {

            vm.addressEditing = false;

            vm.profileData = inputUser || userService.profileData;
            vm.profileData.props = vm.profileData.props || {};
            vm.profileData.profileImageURL = userService.getAvatar(vm.profileData);

            vm.owner = vm.profileData.props.owner;
            vm.started = getFormattedDate(vm.profileData.props.started);

            vm.mileUnit = vm.profileData.props.mileUnit || 'miles';

            if (!_.isEmpty(parameters.target)) {
                vm.hash = parameters.target;
                $timeout(function () {
                    $location.hash(parameters.target);
                    var scroller = $ionicScrollDelegate.$getByHandle('mainScroll');
                    var instance = _.find(scroller._instances, { '$$delegateHandle': 'mainScroll' });
                    instance.anchorScroll(true);
                }, 150);
            }
        }

        function toggleMileUnit (unit) {
            // debugger;
            vm.mileUnit = unit || 'miles';
        }

        function updateTrailers (trailers) {
            if (!trailers) { return; }
            vm.profileData.props.trailer = trailers;
        }

        function updateTrucks (truck) {
            if (!truck) { return; }
            vm.profileData.props.truck = truck;
        }

        function showEditAddress () {
            profileModalsService.showProfileEditAddressModal({ address: vm.profileData.address });

            vm.addressEditing = true;
        }

        function showProfileEditTrailersModal () {
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

        function showProfileEditTrucksModal () {
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

        function showProfileEditLicenseModal () {
            profileModalsService
                .showProfileEditLicenseModal({ license: vm.profileData.license })
                .then(function success (license) {
                    logger.debug('Updated License to ', license);
                    vm.profileData.license = license;
                });
        }

        function getFormattedDate (date) {
            return $filter('date')($filter('monthDate')(date), 'MMMM, yyyy');
        }

        function save (form, e) {
            e.preventDefault();
            logger.warn(' form --->>>', form);
            LoadingService.showLoader('Saving Profile');

            if (form.$valid) {
                // Update the started date
                if (vm.owner !== null) { vm.profileData.props.owner = vm.owner; }
                vm.profileData.props.mileUnit = vm.mileUnit;
                // debugger;

                if (/\d{4,4}-\d{2,2}/.test(vm.started)) {
                    vm.profileData.props.started = vm.started;
                }

                logger.debug('Saving user data: ', vm.profileData);
                return userService.updateUserData(vm.profileData)
                    .then(function (success) {
                        if (success.id) {
                            vm.closeModal(success);
                            LoadingService.hide();
                        }
                        else {
                            LoadingService.showFailure();
                            // vm.closeModal(null);
                        }
                    });
            }

            if (form.$error.number) {
                LoadingService.showFailure('Please enter value as a number');
            } else if (form.$error.required) {
                LoadingService.showFailure('Please enter all required fields');
            } else {
                LoadingService.showFailure('Sorry, an error occured');
            }

            $timeout(function () {
                $('input.ng-invalid').focus();
            }, 1000);

        }

        function logout () {
            userService
                .signOut()
                .then(function (data) {
                    logger.debug('Logout Successful with Result: ', data);

                    LoadingService.showLoader('Logging Out');

                    tokenService.set('access_token', '');
                    tokenService.set('refresh_token', '');
                    tokenService.set('token_type', '');

                    vm.cancelModal('logout');

                    // clear controllers data
                    $rootScope.$broadcast('clear');

                    $state.go('login')
                        .then(function () {
                            LoadingService.hide();
                        })
                        .catch(function (err) {
                            logger.error(err, 'Failed to change state to login');
                            LoadingService.showFailure('Sorry, Logout Failed');
                        })
                        .finally(function () {
                            $ionicHistory.$clearHistory();
                            $ionicHistory.clearCache();
                        });
                });
        }
    }
})();
