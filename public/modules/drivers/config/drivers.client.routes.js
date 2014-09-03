'use strict';

//Setting up route
angular.module('drivers').config(['$stateProvider',
	function($stateProvider) {
		// Drivers state routing
		$stateProvider.
		state('listDrivers', {
			url: '/drivers',
			templateUrl: 'modules/drivers/views/list-drivers.client.view.html'
		}).
		state('createDriver', {
			url: '/drivers/create',
			templateUrl: 'modules/drivers/views/create-driver.client.view.html'
		}).
		state('viewDriver', {
			url: '/drivers/:driverId',
			templateUrl: 'modules/drivers/views/view-driver.client.view.html'
		}).
		state('editDriver', {
			url: '/drivers/:driverId/edit',
			templateUrl: 'modules/drivers/views/edit-driver.client.view.html'
		});
	}
]);