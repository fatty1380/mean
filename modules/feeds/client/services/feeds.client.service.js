(function() {
'use strict';

//Feeds service used to communicate Feeds REST endpoints
angular.module('feeds').factory('Feeds', ['$resource',
	function($resource) {
		return $resource('api/feeds/:feedId', 
			{ feedId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

function feedFactory($resource, $q) {
	var feedRsrc = $resource('api/feed/:feedItemId',
		{ feedItemId: '@_id'},
		{ update: {method: 'PUT'}});
		
	var factory = {
		load: loadFeed,
		getItem: getFeedItem,
		item: feedRsrc,
		
	};
	
	return factory;
	
	//////////////////////////////
	
	function loadFeed(userId) {
		return feedRsrc.get().$promise;
	}
	
	function getFeedItem(item) {
		if(_.isString(item)) {
			return feedRsrc.get({feedItemId: item}).$promise;
		} 
			
		return feedRsrc.get({feedItemId: item.id}).$promise;
	}
}

feedFactory.$inject = ['$resource', '$q'];

angular.module('feeds')
	.factory('Feed', feedFactory);
	
})();