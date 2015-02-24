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
            getByUser: function(userId) {
                var rsrc = $resource('api/users/:userId/driver', {
                    userId: '@_userId'
                });

                return rsrc.get({userId: userId}).$promise;
            },
            getResumeLink: function(driverId) {
                var rsrc = $resource('api/drivers/:driverId/resume', {
                    driverId: '@driverId'
                });

                return rsrc.get({driverId: driverId}).$promise;
            },
            getReportLink: function(driverId, sku) {
                var rsrc = $resource('api/drivers/:driverId/report/:reportSku', {
                    driverId: '@driverId',
                    reportSku: '@sku'
                });

                return rsrc.get({driverId: driverId, sku: sku}).$promise;
            },
            getDownloadLink: function(driverId, sku) {

                var endpoint = 'api/drivers/:driverId/';
                var args = { driverId: '@driverId'};

                if(!!sku && sku !== 'resume') {
                    args.sku = '@sku';
                    endpoint += 'report/:sku';
                } else {
                    endpoint += 'resume';
                }

                return $resource(endpoint, args).get({driverId: driverId, sku: sku}).$promise;
            }
        };
    }

    DriverFactory.$inject = ['$resource'];

    angular
        .module('drivers')
        .factory('Drivers', DriverFactory);
})();
