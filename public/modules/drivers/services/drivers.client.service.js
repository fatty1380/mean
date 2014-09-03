'use strict';

//Drivers service used to communicate Drivers REST endpoints
function DriverFactory($resource) {
    debugger;
    return $resource('drivers/:driverId', {
        driverId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}

DriverFactory.$inject = ['$resource'];

angular
    .module('drivers')
    .factory('Drivers', DriverFactory);
