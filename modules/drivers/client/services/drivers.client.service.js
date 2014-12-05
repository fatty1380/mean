'use strict';

//Drivers service used to communicate Drivers REST endpoints
function DriverFactory($resource) {
    return {
        ById: $resource('api/drivers/:driverId', {
            driverId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        ByUser: $resource('api/users/:userId/driver', {
            userId: '@userId'
        })
    };
}

DriverFactory.$inject = ['$resource'];

angular
    .module('drivers')
    .factory('Drivers', DriverFactory);
