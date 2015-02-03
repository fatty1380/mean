(function () {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function ConfigFactory($resource, $log, $q) {
        var months, faqs, modules;
        return {
            getStates: function () {
                var rsrc = $resource('api/config/states');
                return rsrc.query();
            },
            getCountries: function () {
                return this.get('countries');
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

                        if (resp.hasOwnProperty(config)) {
                            d.resolve(resp[config]);
                        } else {
                            d.resolve(resp);
                        }
                    },
                    function (err) {
                        $log.log('[AppCfg] "%s" is not an available', config, err);
                        d.reject(err);
                    }
                );

                d.promise.then(function(f) {
                    return f;
                }, function(e) {
                    $log.warn('Swallowing error: %o', e);
                    return null;
                });
            },
            getAsync: function (config) {
                var rsrc = $resource('api/config/' + config);

                return rsrc.get().$promise.then(
                    function (success) {
                        if (success.hasOwnProperty(config)) {
                            return $q.when(success[config]);
                        } else {
                            return $q.when(success);
                        }
                    },
                    function (err) {
                        $log.log('[AppCfg] "%s" is not an available', config, err);
                        return $q.when(null);
                    }
                );
            },
            getReports: function () {
                var rsrc = $resource('api/config/reports');
                return rsrc.get();
            },
            getFaqs: function (myfilter) {
                var d = $q.defer();
                if (!faqs) {
                    var rsrc = $resource('api/config/faqs');
                    rsrc.query().$promise.then(function (resp) {
                        $log.debug('faq response: %o', resp);
                        faqs = _.filter(resp, myfilter || {});

                        d.resolve(faqs);
                    }, function (err) {
                        $log.debug('got faq error: %o', err);
                        d.resolve([]);
                    });
                } else {
                    d.resolve(faqs);
                }

                return d.promise;
            },
            getModuleConfig: function(userType, moduleName) {
                var d = $q.defer();
                if (!modules) {
                    var rsrc = $resource('api/config/modules');

                    rsrc.get().$promise.then(function (resp) {
                        d.resolve(paramFilter(resp, userType, moduleName));
                    }, function (err) {
                        $log.debug('got config error: %o', err);
                        d.resolve({});
                    });
                } else {
                    return paramFilter(modules, userType, moduleName);
                }

                function paramFilter(configs, userType, moduleName) {

                    var retVal = configs;

                    if(userType) {
                        retVal = retVal[userType];
                    }

                    if(moduleName) {
                        retVal = retVal[moduleName];
                    }

                    return retVal;
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
