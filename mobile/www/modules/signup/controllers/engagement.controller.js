(function () {
    'use strict';

    var engagementCtrl = function ($scope, $state, registerService, $ionicPopup, $ionicLoading, cameraService, $ionicModal, $ionicActionSheet, userService, profileAvatarService) {

        var vm = this;
        vm.handle = "";
        vm.started = "";
        vm.company = "Default Company";
        vm.camera = cameraService;

        vm.initEngagementForm = function(scope){
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

        //update avatar after change data
        $scope.$watch(function () {
            return userService.profileData;
        },
        function () {
            vm.profileData = userService.profileData;
        }, true);

        vm.continueToLicense = function() {
            registerService.dataProps.props.started = vm.started;
            registerService.dataProps.props.avatar = profileAvatarService.finalImage;
            registerService.dataProps.handle = vm.handle;
            $state.go('signup/license');
        }
    };

    engagementCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', '$ionicLoading', 'cameraService', '$ionicModal', '$ionicActionSheet', 'userService', 'profileAvatarService' ];

    angular
        .module('signup')
        .controller('engagementCtrl', engagementCtrl)
})();
