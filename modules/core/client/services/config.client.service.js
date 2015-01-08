(function() {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function ConfigFactory($resource) {
        return {
            getStates: function() {
                var rsrc = $resource('api/config/states');
                return rsrc.query();
            },
            getBaseSchedule: function() {
                var rsrc = $resource('api/config/baseSchedule');
                return rsrc.query();
            }
        };
    }

    ConfigFactory.$inject = ['$resource'];

    angular
        .module('core')
        .factory('AppConfig', ConfigFactory);

})();
