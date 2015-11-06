(function () {
    'use strict';

    angular
        .module('signup')
        .controller('EngagementCtrl', EngagementCtrl)

    EngagementCtrl.$inject = ['$scope', '$state', 'registerService', 'cameraService', 'userService', 'avatarService'];

    function EngagementCtrl($scope, $state, registerService, cameraService, userService, avatarService) {

        var vm = this;
        vm.handle = '';
        vm.started = '';
        vm.company = '';
        vm.owner = null;
        vm.camera = cameraService;

        vm.initEngagementForm = initEngagementForm;
        vm.continueToLicense = continueToLicense;

        function initEngagementForm(scope) {
            vm.form = scope;
        }

        //$scope.$on('$ionicView.afterEnter', function () {
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        window.cordova.plugins.Keyboard.disableScroll(true);
        //    }
        //});
        //$scope.$on('$ionicView.beforeLeave', function () {
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        window.cordova.plugins.Keyboard.disableScroll(false);
        //    }
        //});

        //update avatar after change data
        $scope.$watch(function () {
            return userService.profileData;
        },
            function () {
                vm.profileData = userService.profileData;
            }, true);


        vm.createStartedDateObject = function (started) {
            if (!started) return null;
            var startedArray = started.split('-');
            
            var year = startedArray[0];
            var month = parseInt(startedArray[1]) - 1;

            return new Date(year, month);
        };
        
        

        /**
         * showEditAvatar - DUPE FROM profile.controller.js
         * --------------
         * Opens an action sheet which leads to either taking
         * a photo, or selecting from device photos.
         */
        vm.showEditAvatar = function (parameters) {
            avatarService.getNewAvatar(parameters, vm.profileData);
        };

        function continueToLicense() {
            // Set Owner/Operator Status if set
            if (vm.owner !== null) {
                registerService.userProps.owner = vm.owner;
            }

            // Set standard Properties
            registerService.userProps.started = vm.createStartedDateObject(vm.started);
            registerService.userProps.avatar = avatarService.getImage();
            registerService.userProps.company = vm.company;
            registerService.userProps.freight = '';
            registerService.userProps.truck = '';

            registerService.updateUserProps(registerService.userProps)
                .then(function success(propsResult) {
                    console.log('Updated User Props ...', propsResult);
                    // TODO: Check for success/fail

                    registerService.userData.handle = vm.handle;
                    return registerService.updateUser(registerService.userData);
                })
                .then(function success(result) {
                    // TODO: Check for success/fail
                    console.error('Saved changes to user', result);
                    $state.go('signup-license');
                })
                .catch(function failure(err) {
                    console.error('Unable to save changes to user', registerService.userData, err);
                    vm.error = 'Unable to save changes';
                });

        }
    }

})();
