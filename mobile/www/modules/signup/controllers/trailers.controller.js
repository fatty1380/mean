(function () {
    'use strict';

    var trailersCtrl = function ($scope, $state, registerService, $ionicLoading, $ionicPopup) {
        var vm = this;

        vm.newTrailer = "";

        vm.trailers = [
            {name:'Box', checked:false},
            {name:'Car Carrier', checked:false},
            {name:'Curtain Sider', checked:false} ,
            {name:'Drop Deck', checked:false},
            {name:'Double Decker', checked:false},
            {name:'Dry Bulk', checked:false},
            {name:'Dump Truck', checked:false},
            {name:'Flatbed', checked:false},
            {name:'Hopper Bottom', checked:false},
            {name:'Live Bottom', checked:false},
            {name:'Livestock', checked:false},
            {name:'Lowboy', checked:false},
            {name:'Refrigerator Trailer', checked:false},
            {name:'Refrigerator Tank', checked:false},
            {name:'Sidelifter', checked:false},
            {name:'Tank', checked:false},
            {name:'Other...', checked:false}
        ];

        vm.addTrailer = function() {
            $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTrailer" autofocus>',
                title: 'Please enter a trailer type',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            vm.newTrailer = "";
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!vm.newTrailer) {
                                e.preventDefault();
                            } else {
                                vm.trailers.push({name:vm.newTrailer, checked:true});
                                vm.newTrailer = "";
                                return vm.newTrailer;
                            }
                        }
                    }
                ]
            });
        };

        vm.continueToProfile = function(isSave) {
            if(isSave){
                registerService.dataProps.props.trailer = getNameKeys(vm.trailers);
            }

           registerService.updateUser(registerService.dataProps)
               .then(function (response) {
                    $ionicLoading.hide();
                    if(response.success) {
                        $state.go("account/profile");
                    }else{
                       // $location.path("signin/signup");
                        vm.showPopup(JSON.stringify(response));
                    }
                });
        };

        var getNameKeys = function (obj) {
            var keys = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (obj[i].checked) {
                        keys.push(obj[i].name);
                    }
                }
            }
            return keys;
        };

        vm.showPopup = function (response) {
            console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: response.title || "title",
                template: response || "no message"
            });
            alertPopup.then(function (res) {
            });
        }
    };

    trailersCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicLoading', '$ionicPopup'];

    angular
        .module('signup')
        .controller('trailersCtrl', trailersCtrl)

})();
