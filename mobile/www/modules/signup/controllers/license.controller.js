(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LicenseCtrl', LicenseCtrl);

    LicenseCtrl.$inject = [ '$state', 'registerService', '$ionicLoading'];

    function LicenseCtrl($state, registerService, $ionicLoading) {

        var vm = this;
        vm.class = null;
        vm.endorsement = {
            T: false,
            P: false,
            S: false,
            N: false,
            H: false,
            X: false
        }
        vm.continueToTrucks = continueToTrucks;

        function continueToTrucks() {
            var obj = {
               license: {
                  class: vm.class,
                  endorsements: getEndorsementKeys(vm.endorsement)
               }
            }

            $ionicLoading.show({
                template: 'please wait'
            });

            registerService.updateUser(obj)
                .then(function (response) {
                    $ionicLoading.hide();

                    if (response.success) {
                        console.log("license response update user : ", response);

                        $state.go('signup-trucks');
                    } else {
                        console.error("license response update user ERROR: ", response);

                        $state.go('login');
                    }
                });
        }

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
    }
})();
