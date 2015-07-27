(function () {
    'use strict';

    var engagementCtrl = function ($scope, $state, registerService, $ionicPopup, $ionicLoading) {

        var vm = this;
        vm.handle = "";
        vm.started = "";
        vm.company = "Default Company";
        
        vm.initEngagementForm= function(scope){
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
            
        vm.continueToLicense = function() {
            registerService.dataProps.props.started = vm.started;
            registerService.dataProps.handle = vm.handle;
            $state.go('signup/license');
        }
        
        $scope.avatarShot = function() {
            console.log('avatarShot');
        }
    };

    engagementCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicPopup', '$ionicLoading'];

    angular
        .module('signup')
        .controller('engagementCtrl', engagementCtrl)
})();
