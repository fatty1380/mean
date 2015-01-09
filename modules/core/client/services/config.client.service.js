(function() {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function ConfigFactory($resource) {
        var months;
        return {
            getStates: function() {
                var rsrc = $resource('api/config/states');
                return rsrc.query();
            },
            getCountries: function() {
                var rsrc = $resource('api/config/countries');
                return rsrc.query();
            },
            getBaseSchedule: function() {
                var rsrc = $resource('api/config/baseSchedule');
                return rsrc.query();
            },
            getMonths: function() {
                if(!months) {
                    months = [];
                    while(months.length < 12) {
                        var m = moment().month(months.length);
                        months.push({num: m.format('MM'), name: m.format('MMMM')});
                    }

                    console.log('ConfigFactory] Returning newly generated months', JSON.stringify(months));
                }
                return months;
            }
        };
    }

    ConfigFactory.$inject = ['$resource'];

    angular
        .module('core')
        .factory('AppConfig', ConfigFactory);

})();
