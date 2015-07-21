(function() {
    'use strict';

    var trailersCtrl = function ($scope, $location, registerService, $ionicLoading, $ionicPopup) {
        var vm = this;
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
            {name:'Other...', checked:false},
        ]

        vm.continueToTrucks = function() {
            console.log(vm);
            //$location.path("signup/truck");

            var obj = {};
            obj.trailers = getNameKeys(vm.trailers);

            registerService.updateUser(obj)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("trailers");
                    console.log(obj);
                    console.log(response);

                    $ionicLoading.hide();
                    if(response.success) {
                        $location.path("profile");
                     //   vm.showPopup(JSON.stringify(response));
                    }else{
                        $location.path("profile");
                      //  vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        var getNameKeys = function(obj) {
            var keys = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if(obj[i].checked) {
                        keys.push(obj[i].name);
                    }
                }
            }
            return keys;
        }

        vm.showPopup = function (response) {
            console.log(response);
            var alertPopup = $ionicPopup.alert({
                title: response.title || "title",
                template: response || "no message"
            });
            alertPopup.then(function(res) {
            });
        }

    };

    trailersCtrl.$inject = ['$scope','$location','registerService', '$ionicLoading', '$ionicPopup'];

    angular
        .module('signup.trailers', [] )
        .controller('trailersCtrl', trailersCtrl )

})();
