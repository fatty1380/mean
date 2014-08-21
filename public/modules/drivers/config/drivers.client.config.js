'use strict';

// Configuring the Articles module
angular.module('drivers').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Drivers', 'drivers', 'dropdown', '/drivers(/create)?');
		Menus.addSubMenuItem('topbar', 'drivers', 'List Drivers', 'drivers');
		Menus.addSubMenuItem('topbar', 'drivers', 'New Driver', 'drivers/create');
	}
]);