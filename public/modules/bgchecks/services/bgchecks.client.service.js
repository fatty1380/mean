'use strict';

//Bgchecks service used to communicate Bgchecks REST endpoints
angular.module('bgchecks').factory('Bgchecks', ['$resource',
	function($resource) {
		return $resource('bgchecks/:bgcheckId', { bgcheckId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);