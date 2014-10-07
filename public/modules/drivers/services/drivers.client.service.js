'use strict';

//Drivers service used to communicate Drivers REST endpoints
function DriverFactory($resource) {
    return $resource('drivers/:driverId', {
        driverId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}

function DriverUserFactory($resource) {
    return $resource('profiles/:userId/driver', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}

DriverFactory.$inject = ['$resource'];
DriverUserFactory.$inject = ['$resource'];

angular
    .module('drivers')
    .factory('Drivers', DriverFactory)
    .factory('Profile.Drivers', DriverUserFactory);
