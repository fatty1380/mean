(function() {
    'use strict';

    var licenseCtrl = function ($scope, $state, $location, registerService, $ionicPopup, $ionicLoading) {
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

        vm.continue = function() {
            console.log(" ");

            var obj = {};
            obj.license = {};
            obj.license.class = vm.class;
            obj.license.endorsements = getEndorsementKeys(vm.endorsement);

            registerService.updateUser(obj)
                .then(function (response) {
                    $ionicLoading.hide();

                    console.log(" ");
                    console.log(" ");
                    console.log("license");
                    console.log(obj);
                    console.log(response);

                    if(response.success) {
                        $location.path("signup/trucks");
                    }else{
                        $location.path("signup/trucks");
                      //  vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        var getEndorsementKeys = function(obj) {
            var keys = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if(obj[i]) {
                        keys.push(i);
                    }
                }
            }
            return keys;
        }
    }

    licenseCtrl.$inject = ['$scope','$state','$location','registerService','$ionicPopup', '$ionicLoading' ];

    angular
        .module('signup.license', [])
        .controller('licenseCtrl',  licenseCtrl);
})();
