'use strict';

// Users service used for communicating with the users REST endpoint

function UsersService($resource) {
    return $resource('api/users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}


function ProfilesService($resource) {
    return $resource('api/profiles/:userId', {
        userId: '@_userId'
    }, {

        });
    }


UsersService.$inject = ['$resource'];
ProfilesService.$inject = ['$resource'];

angular
    .module('users')
    .factory('Users', UsersService)
    .factory('Profiles', ProfilesService);
