(function () {
	'use strict';

	angular
		.module('users')
		.factory('Requests', RequestsService);

	RequestsService.$inject = ['$resource', '$log', '$q'];
	function RequestsService($resource, $log, $q) {
		var service = {
			create: createRequest,
			list: listRequests,
			get: getRequest,
			update: updateRequest
		};

		var RequestMsgRsrc = $resource('api/requests/:requestId',
			{ requestId: '@_id' }, {
				update: { method: 'PUT' }
			});

		return service;
        
		///////////////////////////////////////////
        
		// POST /api/requests
		function createRequest(obj) {
			var request = new RequestMsgRsrc(obj);

			return request.$save().then(
				function (success) {
					$log.debug('created new friend request: %o', success);
					return success;
				});
		}
        
		// GET /api/requests
		function listRequests(query) {
			return RequestMsgRsrc.query(query).$promise;
		}

		// GET /api/requests/:requestId
		function getRequest(id) {
			if (!id) {
				return $q.when({});
			}

			return RequestMsgRsrc.get({ requestId: id }).$promise;
		}

		function updateRequest(id, data) {
			return RequestMsgRsrc.update(id, data).$promise;
		}
        
		/////////////////////////////////
        
	}
})();