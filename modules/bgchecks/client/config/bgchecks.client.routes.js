'use strict';

//Setting up route
angular.module('bgchecks').config(['$stateProvider',
	function($stateProvider) {
		// Bgchecks state routing
		$stateProvider.
		state('listBgchecks', {
			url: '/bgchecks',
			templateUrl: 'modules/bgchecks/views/list-bgchecks.client.view.html'
		}).
		state('createBgcheck', {
			url: '/bgchecks/create',
			templateUrl: 'modules/bgchecks/views/create-bgcheck.client.view.html'
		}).
		state('viewBgcheck', {
			url: '/bgchecks/:bgcheckId',
			templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html'
		}).
		state('editBgcheck', {
			url: '/bgchecks/:bgcheckId/edit',
			templateUrl: 'modules/bgchecks/views/edit-bgcheck.client.view.html'
		});
	}
]);