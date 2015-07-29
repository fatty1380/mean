'use strict';

//Documents service used to communicate Documents REST endpoints
angular.module('documents').factory('Documents', ['$resource',
	function($resource) {
		return $resource('api/documents/:documentId', { documentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);