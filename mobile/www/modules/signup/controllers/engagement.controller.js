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


        vm.createStartedDateObject = function (started) {
            if(!started) return '';
            var startedArray = started.split('-');

            return new Date(startedArray[0], startedArray[1]);
        };

        function continueToLicense() {
            registerService.dataProps.props.started = vm.createStartedDateObject(vm.started);
            registerService.dataProps.props.avatar = profileAvatarService.finalImage;
            registerService.dataProps.handle = vm.handle;
            registerService.dataProps.props.company = 'Apple';
            registerService.dataProps.props.freight = 'computers';
            registerService.dataProps.props.truck = 'volvo';
            $state.go('signup/license');
        }
    };

})();
