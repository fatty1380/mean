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

angular.module('drivers')
    .factory('Drivers', ['$resource', DriverFactory]);
