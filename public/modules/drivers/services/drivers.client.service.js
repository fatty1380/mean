'use strict';

//Drivers service used to communicate Drivers REST endpoints
function DriverFactory($resource) {
    return {
        ById: $resource('drivers/:driverId', {
            driverId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        ByUser: $resource('users/:userId/driver', {
            userId: '@_id'
        })
    };
}

DriverFactory.$inject = ['$resource'];

angular
    .module('drivers')
    .factory('Drivers', DriverFactory);
