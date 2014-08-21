'use strict';

//Drivers service used to communicate Drivers REST endpoints
angular.module('drivers').factory('Drivers', ['$resource',
	function($resource) {
		return $resource('drivers/:driverId', { driverId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);