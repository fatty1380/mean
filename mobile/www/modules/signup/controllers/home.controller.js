(function () {
    'use strict';

    angular
        .module('signup')
        .controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ['$scope', '$cordovaGoogleAnalytics'];

    function HomeCtrl($scope, $cordovaGoogleAnalytics) {

        var then = Date.now();
        
        $scope.$on('$ionicView.enter', function () {
            then = Date.now();
        });

        $scope.$on('$ionicView.leave', function () {
            $cordovaGoogleAnalytics.trackTiming('Home', Date.now() - then, 'Landing', 'timeOnPage');
        });


    }

})();
