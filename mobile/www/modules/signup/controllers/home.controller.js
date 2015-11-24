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
            $cordovaGoogleAnalytics.trackEvent('signup', 'home', 'timeOnPage', Date.now() - then);
        });


    }

})();
