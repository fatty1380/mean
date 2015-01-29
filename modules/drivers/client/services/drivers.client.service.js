(function () {
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
                userId: '@_userId'
            }),
            getResumeLink: function(driverId) {
                var rsrc = $resource('api/drivers/:driverId/resume', {
                    driverId: '@driverId'
                });

                return rsrc.get({driverId: driverId}).$promise;
            }
        };
    }

    DriverFactory.$inject = ['$resource'];

    angular
        .module('drivers')
        .factory('Drivers', DriverFactory);
})();
