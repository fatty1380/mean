(function () {
    'use strict';

    function FooterController($scope) {
        $scope.isCollapsed = false;

        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });

        $scope.year = ( new Date() )
            .getFullYear();
    }

    FooterController.$inject = ['$scope'];

    angular
        .module('core')
        .controller('FooterController', FooterController);


})();
