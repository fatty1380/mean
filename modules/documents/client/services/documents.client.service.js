(function () {
	'use strict';
	
	//Documents service used to communicate Documents REST endpoints
	angular.module('documents').factory('Documents', ['$resource',
		function($resource) {
			
			var ProfileRSRC = $resource('/api/profiles/:userId/documents', { userId: '@_id' });
			var DocumentRSRC = $resource('api/documents/:documentId', { documentId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
				});
			
			var service = {
				byUser: ProfileRSRC,
				byId: DocumentRSRC,


			};
			
			return service;
		}
	]); 
})();