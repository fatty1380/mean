(function() {
    'use strict';

    function HomeController($scope, $location, $state, $anchorScroll, $modal, $log, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.showMain = true;
        $scope.showInfo = false;
        $scope.showSignup = false;

        $scope.gotoSignup = function() {
            $scope.showMain = false;
            $scope.showInfo = false;
            $scope.showSignup = true;

            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('signup_type');

            // call $anchorScroll()
            $anchorScroll();
        };
    }

    HomeController.$inject = ['$scope', '$location', '$state', '$anchorScroll', '$modal', '$log', 'Authentication'];

    angular
        .module('core')
        .controller('HomeController', HomeController);
})();
