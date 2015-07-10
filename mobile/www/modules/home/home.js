(function () {
    'use strict';

    var homeCtrl = function ($scope, $state) {
        $scope.model =  {
            activeSlide: 1
        };

        console.log($state.current.name);
    };

    angular
        .module('home', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'modules/home/home.html',
                    controller: 'homeCtrl'
                }
            )
        }])
        .controller('homeCtrl', [
            '$scope',
            '$state',
            homeCtrl
        ]);

})();