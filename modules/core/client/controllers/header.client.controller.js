(function() {
'use strict';

    function HeaderController($scope, $state, Authentication, Menus) {
		$scope.$state = $state;
		$scope.authentication = Authentication;

		// Get the topbar menu
		$scope.menu = Menus.getMenu('topbar');
        $scope.stateLink = 'intro';

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
