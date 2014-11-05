'use strict';

// Users service used for communicating with the users REST endpoint

function ProfileService($resource) {
    return $resource('profiles/:userId', {
        userId: '@userId'
    }, {
    });
}

ProfileService.$inject = ['$resource'];

angular
    .module('users')
    .factory('Profile', ProfileService);
