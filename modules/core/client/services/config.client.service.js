(function () {
    'use strict';


    angular
        .module('core')
        .factory('AppConfig', ConfigFactory);

    ConfigFactory.$inject = ['$resource', '$log', '$q'];
    function ConfigFactory($resource, $log, $q) {
        var months, faqs, modules, options;

        return {
            getStates: function () {
                var rsrc = $resource('config/states');
                return rsrc.query();
            },
            getCountries: function () {
                return this.get('countries');
            },
            getBaseSchedule: function () {
                var rsrc = $resource('config/baseSchedule');
                return rsrc.query();
            },
            getMonths: function () {
                if (!months) {
                    months = [];
                    while (months.length < 12) {
                        var m = moment().month(months.length);
                        months.push({ num: m.format('MM'), name: m.format('MMMM') });
                    }

                    console.log('ConfigFactory] Returning newly generated months', JSON.stringify(months));
                }
                return months;
            },
            get: function (config) {
                var rsrc = $resource('config/' + config);
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

                d.promise.then(function (f) {
                    return f;
                }, function (e) {
                    $log.warn('Swallowing error: %o', e);
                    return null;
                });
            },
            getAsync: function (config) {
                var rsrc = $resource('config/' + config);

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
                var rsrc = $resource('config/reports');
                return rsrc.query()
                    .$promise
                    .then(function (result) {
                        return result;
                    })
                    .catch(function fail(err) {
                        $log.error('Failed to load reports from server', err);
                        return null;
                    });
            },
            getFaqs: function (myfilter) {
                var d = $q.defer();
                if (!faqs) {
                    var rsrc = $resource('config/faqs');
                    rsrc.query().$promise.then(function (resp) {
                        $log.debug('faq response: %o', resp);
                        var filter = myfilter || {};
                        if (!!filter.category && !!filter.category.length) {
                            faqs = _.filter(resp, function (item) {
                                return _.contains(filter.category, item.category);
                            });
                        }
                        else {
                            faqs = resp;
                        }

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
            getOptions: function () {
                if (!!options) {
                    return $q.when(options);
                }

                var rsrc = $resource('config/options');

                return rsrc.get().$promise.then(function (response) {
                    options = response;
                    return options;
                });
            },
            getModuleConfig: function (userType, moduleName) {
                if (!modules) {
                    var rsrc = $resource('config/modules');

                    return rsrc.get().$promise
                        .then(function (resp) {
                            return paramFilter(resp, userType, moduleName);
                        }, function (err) {
                            $log.debug('got config error: %o', err);
                            return {};
                        });
                } else {
                    return $q.when(paramFilter(modules, userType, moduleName));
                }
            }
        };

        function paramFilter(configs, userType, moduleName) {
            $log.debug('Filtering configs by userType: (%s) and moduleName: (%s). %o', userType, moduleName, configs);
            if (!configs) {
                return {};
            }

            var retVal = configs;

            if (userType) {
                retVal = retVal[userType];
            }

            if (moduleName) {
                retVal = retVal[moduleName];
            }

            return retVal;
        }
    }

})();
