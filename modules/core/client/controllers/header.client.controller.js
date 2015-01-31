(function() {
    'use strict';

    function HeaderController($scope, $state, Authentication, Menus) {
        $scope.$state = $state;
        $scope.authentication = Authentication;
        $scope.navbarClass = ''; //'navbar-inverse';

        // Get the topbar menu
        if ($scope.authentication.user && $scope.authentication.isAdmin()) {
            $scope.menu = Menus.getMenu('adminbar');
            //$scope.navbarClass = 'navbar-inverse';
        } else {
            $scope.menu = Menus.getMenu('topbar');
            //$scope.navbarClass = 'navbar-default';
        }
        $scope.stateLink = '';

        // Toggle the menu items
        $scope.isCollapsed = false;
        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            $scope.isCollapsed = false;
        });
    }


    HeaderController.$inject = ['$scope', '$state', 'Authentication', 'Menus'];

    angular
        .module('core')
        .controller('HeaderController', HeaderController);

})();
