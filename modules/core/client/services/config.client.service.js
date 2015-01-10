(function () {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function ConfigFactory($resource, $log, $q) {
        var months;
        return {
            getStates: function () {
                var rsrc = $resource('api/config/states');
                return rsrc.query();
            },
            getCountries: function () {
                var rsrc = $resource('api/config/countries');
                return rsrc.query();
            },
            getBaseSchedule: function () {
                var rsrc = $resource('api/config/baseSchedule');
                return rsrc.query();
            },
            getMonths: function () {
                if (!months) {
                    months = [];
                    while (months.length < 12) {
                        var m = moment().month(months.length);
                        months.push({num: m.format('MM'), name: m.format('MMMM')});
                    }

                    console.log('ConfigFactory] Returning newly generated months', JSON.stringify(months));
                }
                return months;
            },
            get: function (config) {
                var rsrc = $resource('api/config/' + config);
                var d = $q.defer();
                rsrc.get().$promise.then(
                    function (resp) {
                        d.resolve(resp);
                    }, function (err) {
                        $log.log('[AppCfg] "%s" is not an available', config, err);
                        return false;
                    });

                return d.promise;
            }
        };
    }

    ConfigFactory.$inject = ['$resource', '$log'];

    angular
        .module('core')
        .factory('AppConfig', ConfigFactory);

})();
