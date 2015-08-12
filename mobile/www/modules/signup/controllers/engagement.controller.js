(function () {
    'use strict';

    angular
        .module('signup')
        .controller('EngagementCtrl', EngagementCtrl)

    EngagementCtrl.$inject = ['$scope', '$state', 'registerService', 'cameraService', 'userService', 'profileAvatarService' ];

    function EngagementCtrl ($scope, $state, registerService, cameraService, userService, profileAvatarService) {

        var vm = this;
        vm.handle = "";
        vm.started = "";
        vm.company = "Default Company";
        vm.camera = cameraService;

        vm.initEngagementForm = initEngagementForm;
        vm.continueToLicense = continueToLicense;

        function initEngagementForm(scope) {
            vm.form = scope;
        }

        function continueToLicense() {
            registerService.setProps('started', vm.started);
            registerService.setProps('avatar', profileAvatarService.finalImage);
            registerService.setDataProps('handle' , vm.handle);
            $state.go('signup/license');
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
    };

})();
