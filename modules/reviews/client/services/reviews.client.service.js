'use strict';

//Reviews service used to communicate Reviews REST endpoints
angular.module('reviews').factory('Reviews', ['$resource',
	function($resource) {
		
		var byId = $resource('api/reviews/:reviewId', { reviewId: '@_id'
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
		
		
		return {
			byId: byId,
			byUser: byUser
		};
		}
]);