(function () {
	'use strict';
	
	//Documents service used to communicate Documents REST endpoints
	angular.module('documents').factory('Documents', ['$resource',
		function($resource) {
			
			var ProfileRSRC = $resource('/api/profiles/:userId/documents',
								{ userId: '@_id' });
								
			var DocumentRSRC = $resource('api/documents/:documentId', 
								{ documentId: '@_id' }, 
								{ update: { method: 'PUT' }});
			
			var RequestRSRC = $resource('api/requests/:requestId',
								{ requestId: '@_id' },
								{ update: { method: 'PUT' }});
			
			var service = {
				byUser: ProfileRSRC,
				byId: DocumentRSRC,
				byReq: RequestRSRC,
				getByRequest: getByRequestId
			};
			
			function getByRequestId(requestId) {
				return RequestRSRC.get({ requestId: requestId }).$promise
					.catch(function reject(err) {
						$log.error('Unable to fetch Request');
					});
			}
			
			return service;
		}
	]); 
})();