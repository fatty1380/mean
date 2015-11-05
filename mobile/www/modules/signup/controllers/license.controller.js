(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LicenseCtrl', LicenseCtrl);

    LicenseCtrl.$inject = ['$state', 'registerService', '$ionicLoading'];

    function LicenseCtrl($state, registerService, $ionicLoading) {

        var vm = this;
        vm.class = null;
        vm.endorsement = endorsementStub;

        vm.header = 'Create Account';
        vm.backTxt = 'Back';
        vm.saveTxt = 'Continue';

        vm.save = save;

        function save() {
            var obj = {
                license: {
                    class: vm.class,
                    endorsements: getEndorsementKeys(vm.endorsement)
                }
            }

            $ionicLoading.show({
                template: 'please wait'
            });

            registerService.updateUser(obj).then(
                function (response) {
                    if (response.success) {
                        console.log("license response update user : ", response);

                        $state.go('signup-trucks');
                        $ionicLoading.hide();
                    } else {
                        console.error("license response update user ERROR: ", response);

                        $state.go('login');
                        $ionicLoading.show({
                            template: 'Unable to Save at this time',
                            duration: 2000
                        });
                    }
                });
        }


    }

    angular
        .module('profile')
        .controller('ProfileEditLicenseCtrl', LicenseCtrl);

    LicenseCtrl.$inject = ['userService', '$ionicLoading'];
    function LicenseProfileCtrl(userService, $ionicLoading) {
        var vm = this;

        vm.class = null;
        vm.endorsement = endorsementStub;

        vm.header = 'Edit License'
        vm.backTxt = 'Cancel';
        vm.saveTxt = 'Save';
        vm.showCancel = true;

        vm.save = save;
        vm.cancel = vm.cancelModal;

        activate();
        
        /////////////////////////////////////////////////////////////////////////////
        
        function activate() {
            var license = userService.profileData && userService.profileData.license;

            if (!_.isEmpty(license)) {
                vm.class = license.class;
                vm.endorsements = license.endorsements;
            }
        }

        function save() {
            var obj = {
                license: {
                    class: vm.class,
                    endorsements: getEndorsementKeys(vm.endorsement)
                }
            }

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner><br>Saving License',
                duration: 10000
            });

            userService.updateUserData(obj).then(
                function success(response) {
                    vm.closeModal(response);
                    $ionicLoading.hide();
                },
                function fail(err) {
                    $ionicLoading.show({
                        template: 'Unable to Save at this time',
                        duration: 2000
                    });
                    console.error(err, 'Failed to update License');
                }
                )
        }
    }
    
    /////////////////////////////////////////////////////////
    
    function getEndorsementKeys(obj) {
        var keys = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i]) {
                    keys.push(i);
                }
            }
        }
        return keys;
    }

    var endorsementStub = {
        T: false,
        P: false,
        S: false,
        N: false,
        H: false,
        X: false
    }
})();
