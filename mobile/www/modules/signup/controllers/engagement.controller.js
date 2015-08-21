(function () {
    'use strict';

    angular
        .module('signup')
        .controller('EngagementCtrl', EngagementCtrl)

    EngagementCtrl.$inject = ['$scope', '$state', 'registerService', 'cameraService', 'userService', 'avatarService' ];

    function EngagementCtrl ($scope, $state, registerService, cameraService, userService, avatarService) {

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
            registerService.setProps('started',vm.createStartedDateObject(vm.started));
            registerService.setProps('avatar', avatarService.getImage());
            registerService.setProps('company', 'Apple');
            registerService.setProps('freight', 'computers');
            registerService.setProps('truck', 'volvo');
            registerService.setDataProps('handle' , vm.handle);

            $state.go('signup-license');
        }
    };
    
})();
