'use strict';

//Articles service used for communicating with the articles REST endpoints

function Articles($resource) {
	return $resource('articles/:articleId', {
		articleId: '@_id'
	}, {
		update: {
			method: 'PUT'
		}
	});
}

Articles.$inject = ['$resource'];

angular
	.module('articles')
	.factory('Articles', Articles);