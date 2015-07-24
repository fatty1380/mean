(function () {
    'use strict';

    var engagementCtrl = function ($scope, $state, registerService, $ionicPopup, $ionicLoading) {

        var vm = this;
        vm.handle = "";
        vm.started = "";
        vm.company = "Default Company";


        vm.initForm = function (scope) {
            vm.form = scope;
        }

        $scope.$on('$ionicView.afterEnter', function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                window.cordova.plugins.Keyboard.disableScroll(true);
            }
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                window.cordova.plugins.Keyboard.disableScroll(false);
            }
        });

        vm.continue = function () {
            console.log('continue license');

            /* var data = {
                 "handle": vm.handle,
                 props:
                 {
                     "started": vm.started,
                     "company" : vm.company
                 }
             };*/

            registerService.dataProps.props.started = vm.started;
            registerService.dataProps.handle = vm.handle;
            console.log(registerService.dataProps);

            $state.go('signup/license');

            /*registerService.updateUser(data)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("engagement");
                    console.log(data);
                    console.log(response);

                    $ionicLoading.hide();
                    if(response.success) {
                        $state.go('signup/license');
                    }else{
                        // vm.showPopup(JSON.stringify(response));
                        $state.go('signup/license');
                    }
                });*/
        }

        vm.showPopup = function (response) {
            console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: response.title || "title",
                template: response || "no message"
            });
            alertPopup.then(function (res) {
                $state.go('signup/license');
            });
        }

        $scope.avatarShot = function () {
            console.log('avatarShot');
        }
    };

    engagementCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', '$ionicLoading'];

    angular
        .module('signup')
        .controller('engagementCtrl', engagementCtrl)
})();
