(function() {
    'use strict';

    var trucksCtrl = function ($scope, $state, $location, registerService, $ionicPopup, $ionicLoading) {
        var vm = this;

        var data = {};
        $scope.currentTruck = {
            name: ''
        };
        vm.trucks = [
            {name:'Peterbilt', logoClass:'peterbilt-logo', checked:false},
            {name:'International', logoClass:'international-logo', checked:false},
            {name:'Freightliner', logoClass:'freightliner-logo', checked:false},
            {name:'Mack Trucks', logoClass:'mack-logo', checked:false},
            {name:'Kenworth', logoClass:'kenworth-logo', checked:false},
            {name:'Volvo', logoClass:'volvo-logo', checked:false}
        ]

        vm.continueToTrailers = function() {

            registerService.updateUser($scope.currentTruck)
                .then(function (response) {

                    console.log(" ");
                    console.log(" ");
                    console.log("trucks");
                    console.log($scope.currentTruck);

                    $ionicLoading.hide();
                    if(response.success) {
                        //$location.path("signup/trailers");
                        //   vm.showPopup(JSON.stringify(response));
                    }else{
                       // $location.path("signup/trailers");
                        //  vm.showPopup(JSON.stringify(response));
                    }
                });
        }

        vm.changeTruck = function(item) {
            console.log(item);
        }

        var getNameKeys = function(obj) {
            var keys = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                  //  console.log(obj[i]);
                    if(obj[i].checked) {
                        keys.push(obj[i].name);
                    }
                }
            }
            return keys;
        }
    };

    trucksCtrl.$inject = ['$scope','$state','$location','registerService','$ionicPopup', '$ionicLoading'];

    angular
        .module('signup.trucks', [] )
        .controller('trucksCtrl', trucksCtrl )

})();
