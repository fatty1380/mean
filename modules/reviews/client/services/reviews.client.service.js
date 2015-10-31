(function () {
	'use strict';

	//Reviews service used to communicate Reviews REST endpoints
	angular.module('reviews').factory('Reviews', ReviewFactory);

	ReviewFactory.$inject = ['$resource'];

	function ReviewFactory($resource) {

		var rsrc = $resource('api/reviews/:id',
			{
				id: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});

		var byUser = $resource('api/profiles/:userId/reviews', { userId: '@userId' }, {
			update: {
				method: 'PUT'
			}
		});
		
		function getById(id) {
			debugger;
			return rsrc.get({id: id}).$promise;
		}


		return {
			ById: rsrc,
			ByUser: byUser,
			getById: getById
		};
	}

})();