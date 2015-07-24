(function() {
    'use strict';

    var engagementCtrl = function($scope, $state, $location, registerService, $ionicPopup, $ionicLoading){

        var vm = this;
        vm.handle = "";
        vm.started = "";
        vm.company = "Default Company";


        vm.initEngagementForm= function(scope){
            vm.form = scope;
        }

        vm.continueToLicense = function() {
            console.log('continue license');
            registerService.dataProps.props.started = vm.started;
            registerService.dataProps.handle = vm.handle;
            console.log(registerService.dataProps);
            $location.path("signup/license");
        }

        $scope.avatarShot = function() {
            console.log('avatarShot');
        }

        $scope.$on( '$ionicView.afterEnter', function () {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                window.cordova.plugins.Keyboard.disableScroll( true );
            }
        });
        $scope.$on( '$ionicView.beforeLeave', function () {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                window.cordova.plugins.Keyboard.disableScroll( false );
            }
        });
    };

    engagementCtrl.$inject = ['$scope','$state','$location','registerService','$ionicPopup', '$ionicLoading' ];

    angular
        .module('signup')
        .controller('engagementCtrl', engagementCtrl)
})();
