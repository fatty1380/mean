(function() {
    'use strict';

    var trucksCtrl = function ($scope, $state, $location, registerService, $ionicPopup, $timeout, $ionicLoading) {
        var vm = this;

        vm.newTruck = "";
        vm.currentTruck = '';

        vm.trucks = [
            {name:'Peterbilt', logoClass:'peterbilt-logo'},
            {name:'International', logoClass:'international-logo'},
            {name:'Freightliner', logoClass:'freightliner-logo'},
            {name:'Mack Trucks', logoClass:'mack-logo'},
            {name:'Kenworth', logoClass:'kenworth-logo'},
            {name:'Volvo', logoClass:'volvo-logo'}
        ]

        vm.addTruck = function() {
           $ionicPopup.show({
                template: '<input type="text" style="text-align: center; height: 35px;font-size: 14px" ng-model="vm.newTruck" autofocus>',
                title: 'Please enter your truck manufacturer',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        onTap: function (e) {
                            vm.newTruck = "";
                        }
                    },
                    {
                        text: 'Save',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!vm.newTruck) {
                                e.preventDefault();
                            } else {
                                vm.trucks.push({name:vm.newTruck, logoClass:''});
                                vm.currentTruck = vm.newTruck;
                                vm.newTruck = "";
                                return vm.newTruck;
                            }
                        }
                    }
                ]
            });
        }

        vm.continueToTrailers = function(isSave) {
            if(isSave){
                registerService.dataProps.props.truck = vm.currentTruck;
            }
            $location.path("signup/trailers");
        }
    };

    trucksCtrl.$inject = ['$scope','$state','$location','registerService', '$ionicPopup', '$timeout'];

    angular
        .module('signup')
        .controller('trucksCtrl', trucksCtrl )

})();
