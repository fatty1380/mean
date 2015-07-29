'use strict';

// Configuring the Documents module
angular.module('documents').run(['Menus',
	function(Menus) {
		// Add the Documents dropdown item
		Menus.addMenuItem('adminbar', {
			title: 'Documents',
			state: 'documents',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('adminbar', 'documents', {
			title: 'List Documents',
			state: 'documents.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('adminbar', 'documents', {
			title: 'Create Document',
			state: 'documents.create'
		});
	}
]);