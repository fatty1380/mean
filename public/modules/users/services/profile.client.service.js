'use strict';

// Users service used for communicating with the users REST endpoint

function ProfileService($resource) {
    debugger;
    return $resource('users/:userId', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}

ProfileService.$inject = ['$resource'];

angular
    .module('users')
    .factory('Profile', ProfileService);
