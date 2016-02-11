/* global AppConfig */
/* global logger */
(function () {
    'use strict';


    angular
        .module(AppConfig.appModuleName)
        .factory('Config', ConfigFactory);

    ConfigFactory.$inject = ['$http', 'settings', '$q'];
    function ConfigFactory($http, settings, $q) {
        
        var cache = {};

        return {
            getStates: function () {
                    debugger;
                if (_.isEmpty(cache.states) || cache.states.$$state.status === 2) {
                    cache.states = $http.get(settings.config + 'states')
                        .then(function (res) {
                            if (_.isObject(res.data)) {
                                return res.data;
                            }
                            return null;
                        })
                        .catch(function (err) {
                            logger.error('Failed to Load States: ', err);
                            return null;
                         });
                }
                
                return cache.states;
            }
        };
    }

})();