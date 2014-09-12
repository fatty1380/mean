'use strict';

// Users service used for communicating with the users REST endpoint

function UsersService($resource) {
    return $resource('users', {}, {
        update: {
            method: 'PUT'
        }
    });
}

UsersService.$inject = ['$resource'];

angular
    .module('users')
    .factory('Users', UsersService);
