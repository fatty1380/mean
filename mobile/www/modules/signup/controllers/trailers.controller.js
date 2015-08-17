(function () {
    'use strict';

    angular
        .module('signup')
        .controller('TrailersCtrl', TrailersCtrl)

    TrailersCtrl.$inject = ['$scope', '$state', 'registerService', '$ionicLoading', '$ionicPopup'];

    function TrailersCtrl($scope, $state, registerService, $ionicLoading, $ionicPopup) {
        var vm = this;
        vm.newTrailer = "";
        var TRAILERS = [
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

        vm.addTrailer = addTrailer;
        vm.continueToProfile = continueToProfile;
        vm.trailers = getTrailers()

        function addTrailer() {
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

        function continueToProfile(isSave) {
            if(isSave){
                registerService.setProps('trailer', getNameKeys(vm.trailers));
            }

           registerService.updateUser(registerService.getDataProps())
           .then(function (response) {
                $ionicLoading.hide();
                if(response.success) {
                    $state.go("account.profile");
                }else{
                    showPopup(JSON.stringify(response));
                }
            });
        };

        function getNameKeys(obj) {
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

        function showPopup(response) {
            var alertPopup = $ionicPopup.alert({
                title: response.title || "title",
                template: response || "no message"
            });
            alertPopup.then(function (res) {});
        }

        function getTrailers() {
            return TRAILERS;
        }
    };
})();
