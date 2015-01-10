(function () {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function ConfigFactory($resource, $log, $q) {
        var months, faqs;
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
            },
            getReports: function() {
                var rsrc = $resource('api/config/reports');
                return rsrc.get();
            },
            getFaqs: function(myfilter) {
                var d = $q.defer();
                if(!faqs) {
                    var rsrc = $resource('api/config/faqs');
                    rsrc.query().$promise.then(function(resp) {
                        $log.debug('faq response: %o', resp);
                        faqs = resp;

                        //.then(function(val) {
                        //    return _.filter(faqs, myfilter);
                        //});

                        d.resolve(resp);
                    }, function(err) {
                        $log.debug('got faq error: %o', err);
                    });
                } else {
                    d.resolve(faqs);
                }

                return d.promise;
            }
        };
    }

    ConfigFactory.$inject = ['$resource', '$log', '$q'];

    angular
        .module('core')
        .factory('AppConfig', ConfigFactory);

})();
