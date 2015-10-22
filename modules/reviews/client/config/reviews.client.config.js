(function () {
	'use strict';

	// Configuring the Reviews module
	angular.module('reviews').run(['Menus',
		function (Menus) {
			// Add the Reviews dropdown item
			Menus.addMenuItem('adminbar', {
				title: 'Reviews',
				state: 'reviews',
				type: 'dropdown'
			});

			// Add the dropdown list item
			Menus.addSubMenuItem('adminbar', 'reviews', {
				title: 'List Reviews',
				state: 'reviews.list'
			});

			// Add the dropdown create item
			Menus.addSubMenuItem('adminbar', 'reviews', {
				title: 'Create Review',
				state: 'reviews.create'
			});
		}
	]);
})();