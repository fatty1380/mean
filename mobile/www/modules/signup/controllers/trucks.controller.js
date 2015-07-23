(function() {
    'use strict';

    var trucksCtrl = function ($scope, $state, $location, registerService, $ionicPopup, $ionicLoading) {
        var vm = this;

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
            registerService.dataProps.props.truck = $scope.currentTruck.name;
            $location.path("signup/trailers");
        }
    };

    trucksCtrl.$inject = ['$scope','$state','$location','registerService'];

    angular
        .module('signup')
        .controller('trucksCtrl', trucksCtrl )

})();
