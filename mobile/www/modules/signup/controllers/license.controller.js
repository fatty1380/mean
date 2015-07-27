(function () {
    'use strict';

    var licenseCtrl = function ($scope, $state, registerService, $ionicPopup, $ionicLoading) {
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

        vm.continueToTrucks = function() {
            console.log(" ");

            var obj = {};
            obj.license = {};
            obj.license.class = vm.class;
            obj.license.endorsements = getEndorsementKeys(vm.endorsement);

            console.log(obj);

            $ionicLoading.show({
                template: 'please wait'
            });

            registerService.updateUser(obj)
                .then(function (response) {
                    $ionicLoading.hide();

                    console.log(" ");
                    console.log("license response update user : ", response);

                    if (response.success) {
                        $state.go('signup/trucks');
                    } else {
                        $state.go('signup/login');
                    }
                });
        }

        var getEndorsementKeys = function (obj) {
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

    licenseCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', '$ionicLoading'];

    angular
        .module('signup')
        .controller('licenseCtrl', licenseCtrl);
})();
