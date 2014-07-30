'use strict';

// Users service used for communicating with the users REST endpoint

function Users($resource) {
	return $resource('users', {}, {
		update: {
			method: 'PUT'
		}
	});
}

Users.$inject = ['$resource'];

angular
	.module('users')
	.factory('Users', Users);