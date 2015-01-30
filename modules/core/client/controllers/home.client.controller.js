(function() {
    'use strict';

    function HomeController($scope, $location, $timeout, $anchorScroll, $document, $log, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.showMain = true;
        $scope.showInfo = false;
        $scope.showSignup = false;

        $scope.lead1 = {
            header: 'Transportation Focused',
            text: 'The hiring website designed specifically for the Transporation Industry. Driver and Employer information is consolidated all in one place.'
        };
        $scope.lead2 = {
            header: 'A Place for Drivers',
            text: 'Manage your reputation and driving career with hosted credentials and government reports on your resume based profile.'
        };
        $scope.lead3 = {
            header: 'An Employer\'s Hiring Hub',
            text: 'Increase the certainty in your hiring process with higher quality and motivated individuals, with access to driver information as soon as you connect.'
        };

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

        if($location.hash()) {
           var element = angular.element(document.getElementById($location.hash()));

            $timeout(function() {
                $document.scrollToElementAnimated(element);
            }, 100);

        }
    }

    HomeController.$inject = ['$scope', '$location', '$timeout', '$anchorScroll', '$document', '$log', 'Authentication'];

    angular
        .module('core')
        .controller('HomeController', HomeController);
})();
