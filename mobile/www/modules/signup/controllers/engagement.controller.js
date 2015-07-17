(function() {
    'use strict';

    angular
        .module('signup.engagement', [])
        .controller('engagementCtrl', function ($scope, $location, registerService, $ionicPopup, $ionicLoading) {

            var vm = this;
            vm.handle = "";
            vm.started = "";
            vm.company = "Default Company";


            vm.initForm= function(scope){
                vm.form = scope;
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

            vm.continue = function() {
                console.log('continue license');

                var data = {
                    "handle": vm.handle,
                    props:
                    {
                        "started": vm.started,
                        "company" : vm.company
                    }
                };
                console.log(data);

                registerService.updateUser(data)
                    .then(function (response) {
                        $ionicLoading.hide();
                        if(response.success) {
                            $location.path("signup/license");
                        }else{
                            vm.showPopup(JSON.stringify(response));
                        }
                    });
            }

            vm.showPopup = function (response) {
                console.log(response);
                var alertPopup = $ionicPopup.alert({
                    title: response.title || "title",
                    template: response || "no message"
                });
                alertPopup.then(function(res) {
                    $location.path("signup/license");
                });
            }

            $scope.avatarShot = function() {
                console.log('avatarShot');
            }
        });

})();
